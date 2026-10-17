"""
GLEC Framework & ISO 14083 Compliant Emissions Calculator
Calculates Well-to-Wheel (WTW) greenhouse gas emissions for multimodal logistics.
"""

from typing import Dict, Tuple
from greengrid.models.cargo import Shipment
from greengrid.models.transport import FuelType, RouteLeg, TransportMode, TransportOption

# Baseline Well-to-Wheel (WTW) Emission Factors in grams CO2e per tonne-kilometer (g CO2e / t-km)
# Reference: GLEC Framework v2.0 / EcoTransIT World / ISO 14083 standards
EMISSION_FACTORS_WTW: Dict[Tuple[TransportMode, FuelType], float] = {
    # Air Freight (Dedicated Freighters e.g. B777F, B747-8F)
    (TransportMode.AIR_CHARTER, FuelType.JET_A1_CONVENTIONAL): 650.0,
    (TransportMode.AIR_CHARTER, FuelType.SAF_30_BLEND): 465.0,     # ~28-30% net lifecycle CO2e reduction
    (TransportMode.AIR_CHARTER, FuelType.SAF_100): 130.0,          # ~80% net lifecycle CO2e reduction

    # Air Freight (Commercial Cargo / Belly-hold)
    (TransportMode.AIR_COMMERCIAL, FuelType.JET_A1_CONVENTIONAL): 510.0,
    (TransportMode.AIR_COMMERCIAL, FuelType.SAF_30_BLEND): 365.0,
    (TransportMode.AIR_COMMERCIAL, FuelType.SAF_100): 102.0,

    # Road Freight (40-tonne Articulated Truck / Mega-trailer, average European/global load factor)
    (TransportMode.ROAD_TRUCK, FuelType.DIESEL_STANDARD): 75.0,
    (TransportMode.ROAD_TRUCK, FuelType.HVO100_BIOFUEL): 11.5,     # Hydrotreated Vegetable Oil: ~85% reduction

    # Rail Freight (Intermodal electric vs diesel)
    (TransportMode.RAIL_FREIGHT, FuelType.ELECTRIC_GRID): 22.0,
    (TransportMode.RAIL_FREIGHT, FuelType.DIESEL_STANDARD): 38.0,

    # Maritime Container Vessel (> 15,000 TEU Ultra Large Container Vessel)
    (TransportMode.SEA_CONTAINER, FuelType.VLSFO_MARINE): 12.5,
    (TransportMode.SEA_CONTAINER, FuelType.LNG_MARINE): 9.2,
}

# Fallback modal default factors if specific fuel not matched
DEFAULT_MODAL_FACTORS: Dict[TransportMode, float] = {
    TransportMode.AIR_CHARTER: 650.0,
    TransportMode.AIR_COMMERCIAL: 510.0,
    TransportMode.ROAD_TRUCK: 75.0,
    TransportMode.RAIL_FREIGHT: 22.0,
    TransportMode.SEA_CONTAINER: 12.5,
    TransportMode.MULTIMODAL: 65.0,
}


class EmissionsCalculator:
    """Calculates and verifies CO2e footprint for logistics corridors."""

    @classmethod
    def get_emission_factor(cls, mode: TransportMode, fuel_type: FuelType) -> float:
        """Returns the emission factor in g CO2e / t-km."""
        key = (mode, fuel_type)
        if key in EMISSION_FACTORS_WTW:
            return EMISSION_FACTORS_WTW[key]
        return DEFAULT_MODAL_FACTORS.get(mode, 80.0)

    @classmethod
    def calculate_leg_emissions(cls, leg: RouteLeg, shipment_tonnes: float, temp_controlled: bool = False) -> float:
        """
        Calculates CO2e for a single leg in kilograms (kg CO2e).
        Formula: (Tonnage * Distance * Factor_g_per_tkm) / 1000
        """
        factor_g_per_tkm = cls.get_emission_factor(leg.mode, leg.fuel_type)
        tonne_km = shipment_tonnes * leg.distance_km
        co2e_kg = (tonne_km * factor_g_per_tkm) / 1000.0

        # Auxiliary energy penalty for active temperature control (refrigerated telemetry / tires)
        if temp_controlled:
            co2e_kg *= 1.08  # +8% auxiliary power factor

        return round(co2e_kg, 2)

    @classmethod
    def calculate_total_emissions(cls, option: TransportOption, shipment: Shipment) -> float:
        """
        Calculates total Well-to-Wheel CO2e for the complete route option in kg.
        """
        tonnes = shipment.total_weight_tonnes
        needs_temp = any(item.requires_temperature_control for item in shipment.items)

        total_kg = 0.0
        for leg in option.legs:
            leg_emissions = cls.calculate_leg_emissions(leg, tonnes, needs_temp)
            leg.calculated_co2e_kg = leg_emissions
            total_kg += leg_emissions

        # If no explicit legs provided, estimate based on primary mode and direct distance
        if not option.legs:
            # Fallback estimation
            est_factor = cls.get_emission_factor(option.primary_mode, FuelType.DIESEL_STANDARD)
            # Default estimated distance 2000 km if empty
            est_distance = 2000.0
            total_kg = (tonnes * est_distance * est_factor) / 1000.0

        return round(total_kg, 2)
