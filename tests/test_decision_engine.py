"""
End-to-End Integration Tests for Revanth — Decision Engine
Tests realistic Formula 1 scenarios and core business logic contracts.
"""

import pytest
from greengrid.data.f1_scenarios import (
    get_melbourne_to_shanghai_scenario,
    get_miami_to_imola_scenario,
    get_european_double_header_scenario,
)
from greengrid.engine.decision_engine import DecisionEngine
from greengrid.models.decision import InfeasibilityReasonCode


@pytest.fixture
def engine():
    return DecisionEngine()


def test_melbourne_to_shanghai_evaluation(engine):
    """
    Tests Scenario 1:
    - 5 total candidate options
    - Rejects Ocean (Deadline exceeded: 380h > 96h)
    - Rejects Passenger Flight (Hazmat Class 9 lithium batteries)
    - Rejects Feeder Plane (Weight capacity 2500kg < 3800kg)
    - 2 feasible options survive (B777F Direct vs SIA 30% SAF blend via SIN)
    - Evaluates 40% emissions, 35% cost, 25% time
    - Confirms recommended option and ranked alternative
    """
    shipment, options, disruptions = get_melbourne_to_shanghai_scenario()
    result = engine.evaluate(shipment, options, disruptions)

    assert result.total_candidates_evaluated == 5
    assert result.feasible_count == 2
    assert result.infeasible_count == 3

    # Check that reasons for disqualification are accurate
    reasons = {inf.reason_code for inf in result.infeasible_options}
    assert InfeasibilityReasonCode.DEADLINE_EXCEEDED in reasons
    assert InfeasibilityReasonCode.HAZMAT_RESTRICTION_VIOLATED in reasons
    assert InfeasibilityReasonCode.WEIGHT_CAPACITY_EXCEEDED in reasons

    # Recommended option must be present
    assert result.recommended_option is not None
    assert result.recommended_option.rank == 1

    # Ranked alternatives must contain the 2nd option
    assert len(result.ranked_alternatives) == 1
    alt = result.ranked_alternatives[0]
    assert alt.rank == 2
    assert alt.tradeoff_vs_best is not None

    # Check weights
    assert result.weights_applied["emissions"] == 0.40
    assert result.weights_applied["cost"] == 0.35
    assert result.weights_applied["time"] == 0.25

    # Check sensitivity scenarios
    assert result.sensitivity_scenarios is not None
    assert "F1 Net Zero Max Green" in result.sensitivity_scenarios


def test_miami_to_imola_with_red_sea_disruption(engine):
    """
    Tests Scenario 2:
    - Verifies Red Sea disruption actively blocks Route 4 (Middle East Feeder Sea Route)
    - Verifies low-carbon multimodal routes (Ocean + HVO100 / Electric Rail) compete
    """
    shipment, options, disruptions = get_miami_to_imola_scenario()
    result = engine.evaluate(shipment, options, disruptions)

    assert result.total_candidates_evaluated == 4
    # The blocked route must be disqualified due to disruption
    blocked_inf = [
        inf for inf in result.infeasible_options
        if inf.reason_code == InfeasibilityReasonCode.DISRUPTION_CORRIDOR_BLOCKED
    ]
    assert len(blocked_inf) == 1
    assert "RED_SEA" in blocked_inf[0].reason_message or "disruption" in blocked_inf[0].reason_message.lower()

    assert result.feasible_count >= 2
    assert result.recommended_option is not None


def test_european_double_header(engine):
    """
    Tests Scenario 3:
    - Intra-European Spa to Zandvoort
    - Compares HVO100 Biofuel Truck vs Diesel vs Electric Rail
    - HVO100 provides ~85% emissions reduction with minimal cost premium
    """
    shipment, options, disruptions = get_european_double_header_scenario()
    result = engine.evaluate(shipment, options, disruptions)

    assert result.feasible_count == 3
    assert result.infeasible_count == 0
    # Top option should be the HVO100 biofuel fleet due to 40% emissions weight!
    assert "HVO" in result.recommended_option.option_name or "Biofuel" in result.recommended_option.option_name
