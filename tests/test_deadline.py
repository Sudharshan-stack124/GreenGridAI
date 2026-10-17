"""
Tests for Deadline Enforcer in GreenGrid Decision Engine
"""

from datetime import datetime, timedelta
import pytest
from greengrid.engine.deadline import DeadlineEnforcer
from greengrid.models.cargo import CargoItem, Shipment
from greengrid.models.decision import InfeasibilityReasonCode
from greengrid.models.transport import TransportMode, TransportOption


@pytest.fixture
def base_shipment():
    ready = datetime(2026, 5, 1, 8, 0)
    return Shipment(
        id="SHP-DEADLINE-TEST",
        title="Deadline Test Shipment",
        origin_code="MIA",
        origin_name="Miami",
        destination_code="BLQ",
        destination_name="Imola",
        ready_time=ready,
        deadline_time=ready + timedelta(hours=72),  # 72 hour available window
        items=[
            CargoItem(
                id="ITM-1",
                name="Front Wing Assembly",
                weight_kg=250.0,
                volume_m3=3.0,
            )
        ],
    )


def test_deadline_enforcement_pass(base_shipment):
    # Route takes 38 hours, fits well inside 72 hour window
    opt = TransportOption(
        id="OPT-FAST",
        name="Express Air",
        carrier="Air Fast",
        primary_mode=TransportMode.AIR_CHARTER,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=50.0,
        validated_transit_hours=38.0,
    )

    eligible, infeasible = DeadlineEnforcer.filter_by_deadline([opt], base_shipment)
    assert len(eligible) == 1
    assert len(infeasible) == 0


def test_deadline_enforcement_fail(base_shipment):
    # Route takes 120 hours, exceeds 72 hour window by 48 hours
    opt = TransportOption(
        id="OPT-SLOW",
        name="Ocean Container",
        carrier="Slow Sea",
        primary_mode=TransportMode.SEA_CONTAINER,
        max_weight_capacity_kg=50000.0,
        max_volume_capacity_m3=100.0,
        validated_transit_hours=120.0,
    )

    eligible, infeasible = DeadlineEnforcer.filter_by_deadline([opt], base_shipment)
    assert len(eligible) == 0
    assert len(infeasible) == 1
    assert infeasible[0].reason_code == InfeasibilityReasonCode.DEADLINE_EXCEEDED
    assert infeasible[0].metrics["deficit_hours"] == 48.0
