"""
Logistics Cost Calculator for GreenGrid
Computes freight rates, fuel surcharges, handling fees, hazmat surcharges, and customs documentation.
"""

from typing import Dict, Tuple
from greengrid.models.cargo import HazmatClass, Shipment
from greengrid.models.transport import FuelType, RouteLeg, TransportMode, TransportOption

# Base Freight Rate in USD per tonne-kilometer ($/t-km) or minimum rate structure
BASE_RATES_USD_PER_TKM: Dict[Tuple[TransportMode, FuelType], float] = {
    (TransportMode.AIR_CHARTER, FuelType.JET_A1_CONVENTIONAL): 1.85,
    (TransportMode.AIR_CHARTER, FuelType.SAF_30_BLEND): 2.15,         # SAF green premium (~16%)
    (TransportMode.AIR_CHARTER, FuelType.SAF_100): 2.65,
    (TransportMode.AIR_COMMERCIAL, FuelType.JET_A1_CONVENTIONAL): 1.20,
    (TransportMode.AIR_COMMERCIAL, FuelType.SAF_30_BLEND): 1.40,
    (TransportMode.AIR_COMMERCIAL, FuelType.SAF_100): 1.80,
    (TransportMode.ROAD_TRUCK, FuelType.DIESEL_STANDARD): 0.12,
    (TransportMode.ROAD_TRUCK, FuelType.HVO100_BIOFUEL): 0.14,        # HVO100 renewable fuel premium (~15%)
    (TransportMode.RAIL_FREIGHT, FuelType.ELECTRIC_GRID): 0.065,
    (TransportMode.RAIL_FREIGHT, FuelType.DIESEL_STANDARD): 0.075,
    (TransportMode.SEA_CONTAINER, FuelType.VLSFO_MARINE): 0.035,
    (TransportMode.SEA_CONTAINER, FuelType.LNG_MARINE): 0.042,
}

DEFAULT_MODAL_RATES: Dict[TransportMode, float] = {
    TransportMode.AIR_CHARTER: 1.85,
    TransportMode.AIR_COMMERCIAL: 1.20,
    TransportMode.ROAD_TRUCK: 0.12,
    TransportMode.RAIL_FREIGHT: 0.065,
    TransportMode.SEA_CONTAINER: 0.035,
    TransportMode.MULTIMODAL: 0.20,
}


class CostCalculator:
    """Calculates transport expenditure, surcharges, and handling costs."""

    @classmethod
    def get_base_rate(cls, mode: TransportMode, fuel_type: FuelType) -> float:
        key = (mode, fuel_type)
        return BASE_RATES_USD_PER_TKM.get(key, DEFAULT_MODAL_RATES.get(mode, 0.25))

    @classmethod
    def calculate_leg_cost(cls, leg: RouteLeg, shipment_tonnes: float) -> float:
        rate = cls.get_base_rate(leg.mode, leg.fuel_type)
        tonne_km = shipment_tonnes * leg.distance_km
        base_freight = tonne_km * rate

        # Leg terminal/handling fee
        handling_fee = 120.0 * shipment_tonnes if leg.mode in [TransportMode.AIR_CHARTER, TransportMode.AIR_COMMERCIAL] else 45.0 * shipment_tonnes
        return round(base_freight + handling_fee, 2)

    @classmethod
    def calculate_total_cost(cls, option: TransportOption, shipment: Shipment) -> float:
        """
        Calculates end-to-end transport cost including:
        - Linehaul freight across all legs
        - Origin warehouse & paddock staging
        - Destination drayage & circuit delivery
        - International customs filing fee
        - Dangerous goods (Hazmat) surcharge
        """
        tonnes = shipment.total_weight_tonnes
        total_cost = 0.0

        for leg in option.legs:
            leg_cost = cls.calculate_leg_cost(leg, tonnes)
            leg.calculated_cost_usd = leg_cost
            total_cost += leg_cost

        # Fixed terminal / ground operations
        origin_terminal_cost = option.origin_handling_hours * 75.0 + (150.0 * tonnes)
        destination_drayage_cost = option.destination_drayage_hours * 85.0 + (180.0 * tonnes)
        total_cost += origin_terminal_cost + destination_drayage_cost

        # Customs documentation fee
        if shipment.customs_required:
            total_cost += 650.0 + (option.customs_handling_hours * 35.0)

        # Hazmat Surcharges (IATA / IMO DGR certified handling)
        if shipment.has_hazmat:
            hazmat_surcharge = 0.0
            if HazmatClass.CLASS_9_LITHIUM_BATTERIES in shipment.hazmat_classes:
                hazmat_surcharge += 1200.0  # Certified fire suppression & thermal containment
            if HazmatClass.CLASS_3_FLAMMABLE_LIQUIDS in shipment.hazmat_classes:
                hazmat_surcharge += 1800.0  # Hazardous liquid drums escort
            total_cost += hazmat_surcharge

        return round(total_cost, 2)
