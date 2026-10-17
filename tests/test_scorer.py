"""
Tests for Scoring Engine in GreenGrid Decision Engine
Verifies 40% emissions, 35% cost, 25% time weighting and normalization logic.
"""

import pytest
from greengrid.engine.scorer import DEFAULT_WEIGHTS, ScoringEngine
from greengrid.models.transport import TransportMode, TransportOption


def test_scorer_exact_weights():
    assert DEFAULT_WEIGHTS["emissions"] == 0.40
    assert DEFAULT_WEIGHTS["cost"] == 0.35
    assert DEFAULT_WEIGHTS["time"] == 0.25
    assert sum(DEFAULT_WEIGHTS.values()) == 1.00


def test_scorer_normalization_and_weights():
    # 3 options with distinct trade-offs:
    # Opt A: Lowest Emissions (0 penalty), highest cost, medium time
    # Opt B: Lowest Cost (0 penalty), highest emissions, slowest time
    # Opt C: Balanced middle
    opt_a = TransportOption(
        id="OPT-A",
        name="Ultra Green",
        carrier="Carrier A",
        primary_mode=TransportMode.ROAD_TRUCK,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=50.0,
        validated_co2e_kg=100.0,    # Best
        validated_cost_usd=5000.0,   # Worst
        validated_transit_hours=30.0,
    )

    opt_b = TransportOption(
        id="OPT-B",
        name="Budget Diesel",
        carrier="Carrier B",
        primary_mode=TransportMode.ROAD_TRUCK,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=50.0,
        validated_co2e_kg=500.0,    # Worst
        validated_cost_usd=1000.0,   # Best
        validated_transit_hours=40.0, # Worst
    )

    opt_c = TransportOption(
        id="OPT-C",
        name="Fast Express",
        carrier="Carrier C",
        primary_mode=TransportMode.AIR_CHARTER,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=50.0,
        validated_co2e_kg=400.0,
        validated_cost_usd=3000.0,
        validated_transit_hours=10.0, # Best
    )

    scored = ScoringEngine.score_options([opt_a, opt_b, opt_c])
    assert len(scored) == 3

    # Check breakdown for Opt A
    opt_a_sb = next(sb for opt, sb in scored if opt.id == "OPT-A")
    assert opt_a_sb.normalized_emissions == 0.0  # Best in emissions
    assert opt_a_sb.emissions_contribution == 40.0 # Full 40 points!
    assert opt_a_sb.normalized_cost == 1.0       # Worst in cost
    assert opt_a_sb.cost_contribution == 0.0      # 0 points for cost

    # Check breakdown for Opt B
    opt_b_sb = next(sb for opt, sb in scored if opt.id == "OPT-B")
    assert opt_b_sb.normalized_cost == 0.0       # Best in cost
    assert opt_b_sb.cost_contribution == 35.0    # Full 35 points!
    assert opt_b_sb.normalized_emissions == 1.0  # Worst in emissions
    assert opt_b_sb.emissions_contribution == 0.0 # 0 points for emissions

    # Check breakdown for Opt C
    opt_c_sb = next(sb for opt, sb in scored if opt.id == "OPT-C")
    assert opt_c_sb.normalized_time == 0.0       # Best in time
    assert opt_c_sb.time_contribution == 25.0    # Full 25 points!


def test_scorer_single_option_edge_case():
    opt = TransportOption(
        id="OPT-SOLO",
        name="Only Option",
        carrier="Carrier",
        primary_mode=TransportMode.ROAD_TRUCK,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=50.0,
        validated_co2e_kg=250.0,
        validated_cost_usd=2000.0,
        validated_transit_hours=20.0,
    )

    scored = ScoringEngine.score_options([opt])
    assert len(scored) == 1
    # When single option, no variance -> score should be 100.0
    assert scored[0][1].total_score == 100.0
