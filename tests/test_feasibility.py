"""
Tests for Feasibility Filter in GreenGrid Decision Engine
"""

from datetime import datetime, timedelta
import pytest
from greengrid.engine.feasibility import FeasibilityFilter
from greengrid.models.cargo import (
    CargoCategory,
    CargoItem,
    CargoPriority,
    HazmatClass,
    Shipment,
)
from greengrid.models.decision import InfeasibilityReasonCode
from greengrid.models.disruption import (
    DisruptionCategory,
    DisruptionEvent,
    DisruptionSeverity,
)
from greengrid.models.transport import FuelType, RouteLeg, TransportMode, TransportOption


@pytest.fixture
def base_shipment():
    ready = datetime(2026, 4, 1, 10, 0)
    return Shipment(
        id="TEST-SHP-01",
        title="Test F1 Shipment",
        origin_code="MEL",
        origin_name="Melbourne",
        destination_code="PVG",
        destination_name="Shanghai",
        ready_time=ready,
        deadline_time=ready + timedelta(hours=96),
        items=[
            CargoItem(
                id="ITEM-1",
                name="Race Car Chassis",
                category=CargoCategory.RACE_CAR,
                priority=CargoPriority.CRITICAL_P1,
                weight_kg=3500.0,
                volume_m3=20.0,
                hazmat_class=HazmatClass.CLASS_9_LITHIUM_BATTERIES,
                requires_temperature_control=True,
            )
        ],
    )


def test_weight_capacity_exceeded(base_shipment):
    # Option capacity is 2,000 kg, but shipment is 3,500 kg
    opt = TransportOption(
        id="OPT-LIGHT",
        name="Small Feeder",
        carrier="Feeder Air",
        primary_mode=TransportMode.AIR_CHARTER,
        max_weight_capacity_kg=2000.0,
        max_volume_capacity_m3=30.0,
        supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES],
        supports_temperature_control=True,
    )

    eligible, infeasible = FeasibilityFilter.filter_options([opt], base_shipment)
    assert len(eligible) == 0
    assert len(infeasible) == 1
    assert infeasible[0].reason_code == InfeasibilityReasonCode.WEIGHT_CAPACITY_EXCEEDED
    assert infeasible[0].metrics["excess_kg"] == 1500.0


def test_hazmat_restriction_violated(base_shipment):
    # Option does not support Class 9 Lithium Batteries
    opt = TransportOption(
        id="OPT-PAX",
        name="Passenger Flight Cargo",
        carrier="Commercial Airline",
        primary_mode=TransportMode.AIR_COMMERCIAL,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=40.0,
        supported_hazmat=[HazmatClass.NONE],
        supports_temperature_control=True,
    )

    eligible, infeasible = FeasibilityFilter.filter_options([opt], base_shipment)
    assert len(eligible) == 0
    assert len(infeasible) == 1
    assert infeasible[0].reason_code == InfeasibilityReasonCode.HAZMAT_RESTRICTION_VIOLATED


def test_temperature_control_unsupported(base_shipment):
    opt = TransportOption(
        id="OPT-NO-REEFER",
        name="Standard Unconditioned Cargo",
        carrier="Standard Air",
        primary_mode=TransportMode.AIR_CHARTER,
        max_weight_capacity_kg=10000.0,
        max_volume_capacity_m3=40.0,
        supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES],
        supports_temperature_control=False,  # Fails requirement!
    )

    eligible, infeasible = FeasibilityFilter.filter_options([opt], base_shipment)
    assert len(eligible) == 0
    assert len(infeasible) == 1
    assert infeasible[0].reason_code == InfeasibilityReasonCode.TEMPERATURE_CONTROL_UNSUPPORTED


def test_disruption_corridor_blockage(base_shipment):
    opt = TransportOption(
        id="OPT-SEA",
        name="Ocean Freight via Red Sea",
        carrier="Maritime Carrier",
        primary_mode=TransportMode.SEA_CONTAINER,
        max_weight_capacity_kg=50000.0,
        max_volume_capacity_m3=100.0,
        supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES],
        supports_temperature_control=True,
        corridors_traversed=["RED_SEA", "SUEZ_CANAL"],
    )

    disruption = DisruptionEvent(
        id="DISR-01",
        title="Red Sea Blockade",
        category=DisruptionCategory.CANAL_CHOKEPOINT,
        severity=DisruptionSeverity.CRITICAL,
        affected_corridors=["RED_SEA"],
        affected_modes=[TransportMode.SEA_CONTAINER],
        completely_blocked=True,
        active=True,
    )

    eligible, infeasible = FeasibilityFilter.filter_options([opt], base_shipment, [disruption])
    assert len(eligible) == 0
    assert len(infeasible) == 1
    assert infeasible[0].reason_code == InfeasibilityReasonCode.DISRUPTION_CORRIDOR_BLOCKED
