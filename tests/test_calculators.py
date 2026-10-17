"""
Tests for GLEC Carbon, Cost, Transit Time Calculators and Validator
"""

from datetime import datetime, timedelta
import pytest
from greengrid.calculators.cost import CostCalculator
from greengrid.calculators.emissions import EmissionsCalculator
from greengrid.calculators.transit_time import TransitTimeCalculator
from greengrid.calculators.validator import MetricsValidator
from greengrid.models.cargo import CargoItem, HazmatClass, Shipment
from greengrid.models.transport import FuelType, RouteLeg, TransportMode, TransportOption


@pytest.fixture
def sample_shipment():
    ready = datetime(2026, 4, 10, 8, 0)
    return Shipment(
        id="SHP-CALC-TEST",
        title="Calculator Test",
        origin_code="LHR",
        origin_name="Silverstone / London",
        destination_code="MXP",
        destination_name="Monza / Milan",
        ready_time=ready,
        deadline_time=ready + timedelta(hours=96),
        items=[
            CargoItem(
                id="ITM-1",
                name="F1 Spare Telemetry Kit",
                weight_kg=2000.0,  # 2.0 tonnes
                volume_m3=10.0,
                hazmat_class=HazmatClass.CLASS_9_LITHIUM_BATTERIES,
            )
        ],
        customs_required=True,
    )


def test_emissions_calculation(sample_shipment):
    # Road leg with HVO100 vs Diesel
    leg_diesel = RouteLeg(
        leg_id="L-DSL",
        origin_code="LHR",
        destination_code="MXP",
        mode=TransportMode.ROAD_TRUCK,
        fuel_type=FuelType.DIESEL_STANDARD,
        carrier_name="Euro Truck",
        distance_km=1200.0,
        transit_hours=18.0,
    )

    leg_hvo = RouteLeg(
        leg_id="L-HVO",
        origin_code="LHR",
        destination_code="MXP",
        mode=TransportMode.ROAD_TRUCK,
        fuel_type=FuelType.HVO100_BIOFUEL,
        carrier_name="Green Truck",
        distance_km=1200.0,
        transit_hours=18.0,
    )

    co2_diesel = EmissionsCalculator.calculate_leg_emissions(leg_diesel, shipment_tonnes=2.0)
    co2_hvo = EmissionsCalculator.calculate_leg_emissions(leg_hvo, shipment_tonnes=2.0)

    # 2 tonnes * 1200 km = 2400 t-km
    # Diesel: 2400 * 75 g = 180,000 g = 180 kg CO2e
    # HVO100: 2400 * 11.5 g = 27,600 g = 27.6 kg CO2e (~85% reduction)
    assert co2_diesel == 180.0
    assert co2_hvo == 27.6
    assert co2_hvo < co2_diesel


def test_cost_calculation(sample_shipment):
    opt = TransportOption(
        id="OPT-ROAD",
        name="Road Transport",
        carrier="Carrier",
        primary_mode=TransportMode.ROAD_TRUCK,
        max_weight_capacity_kg=24000.0,
        max_volume_capacity_m3=80.0,
        origin_handling_hours=3.0,
        destination_drayage_hours=2.0,
        customs_handling_hours=4.0,
        legs=[
            RouteLeg(
                leg_id="L1",
                origin_code="LHR",
                destination_code="MXP",
                mode=TransportMode.ROAD_TRUCK,
                fuel_type=FuelType.DIESEL_STANDARD,
                carrier_name="Haulier",
                distance_km=1200.0,
                transit_hours=18.0,
            )
        ],
    )

    cost = CostCalculator.calculate_total_cost(opt, sample_shipment)
    # Should include base freight, handling, customs, and hazmat class 9 surcharge
    assert cost > 1500.0


def test_validator_detects_missing_and_populates(sample_shipment):
    opt = TransportOption(
        id="OPT-NO-METRICS",
        name="Empty Metrics Option",
        carrier="Carrier",
        primary_mode=TransportMode.ROAD_TRUCK,
        max_weight_capacity_kg=24000.0,
        max_volume_capacity_m3=80.0,
        legs=[
            RouteLeg(
                leg_id="L1",
                origin_code="LHR",
                destination_code="MXP",
                mode=TransportMode.ROAD_TRUCK,
                fuel_type=FuelType.HVO100_BIOFUEL,
                carrier_name="Green Haul",
                distance_km=1000.0,
                transit_hours=15.0,
            )
        ],
    )

    report = MetricsValidator.validate_or_calculate(opt, sample_shipment)
    assert opt.validated_co2e_kg is not None
    assert opt.validated_cost_usd is not None
    assert opt.validated_transit_hours is not None
    assert report.used_calculated_co2e is True
    assert report.used_calculated_cost is True
    assert report.used_calculated_time is True
