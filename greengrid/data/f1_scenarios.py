"""
Formula 1 Logistics Test Scenarios for GreenGrid
Demonstrates real-world Grand Prix freight movement across global calendars.
"""

from datetime import datetime, timedelta
from typing import List, Tuple
from greengrid.models.cargo import (
    CargoCategory,
    CargoItem,
    CargoPriority,
    HazmatClass,
    Shipment,
)
from greengrid.models.disruption import (
    DisruptionCategory,
    DisruptionEvent,
    DisruptionSeverity,
)
from greengrid.models.transport import FuelType, RouteLeg, TransportMode, TransportOption


def get_melbourne_to_shanghai_scenario() -> Tuple[Shipment, List[TransportOption], List[DisruptionEvent]]:
    """
    Scenario 1: Critical Hybrid Power Units, Spare Chassis & Telemetry
    Route: Melbourne (Albert Park) -> Shanghai International Circuit
    Tight 4-day (96 hour) turnaround before scrutineering.
    Contains Class 9 Hazmat Lithium-ion batteries (350kW ERS-K).
    """
    ready_time = datetime(2026, 3, 23, 8, 0)
    deadline_time = ready_time + timedelta(hours=96)

    items = [
        CargoItem(
            id="CRG-PU-01",
            name="Ferrari 2026 Hybrid Power Unit 01 (V6 Turbo + MGU-K)",
            category=CargoCategory.POWER_UNIT,
            priority=CargoPriority.CRITICAL_P1,
            weight_kg=1650.0,
            volume_m3=6.5,
            hazmat_class=HazmatClass.CLASS_9_LITHIUM_BATTERIES,
            declared_value_usd=3500000.0,
            requires_temperature_control=True,
        ),
        CargoItem(
            id="CRG-PU-02",
            name="Ferrari 2026 Hybrid Power Unit 02 (Reserve)",
            category=CargoCategory.POWER_UNIT,
            priority=CargoPriority.CRITICAL_P1,
            weight_kg=1650.0,
            volume_m3=6.5,
            hazmat_class=HazmatClass.CLASS_9_LITHIUM_BATTERIES,
            declared_value_usd=3500000.0,
            requires_temperature_control=True,
        ),
        CargoItem(
            id="CRG-CHS-01",
            name="Spare Carbon Monocoque Survival Cell Chassis",
            category=CargoCategory.CHASSIS_SPARES,
            priority=CargoPriority.CRITICAL_P1,
            weight_kg=500.0,
            volume_m3=11.0,
            hazmat_class=HazmatClass.NONE,
            declared_value_usd=1200000.0,
            requires_temperature_control=False,
        ),
    ]

    shipment = Shipment(
        id="F1-SHP-MEL-PVG-2026",
        title="Melbourne to Shanghai: Power Units & Chassis Spares",
        origin_code="MEL",
        origin_name="Melbourne Tullamarine / Albert Park Paddock",
        destination_code="PVG",
        destination_name="Shanghai Pudong / Shanghai Circuit",
        ready_time=ready_time,
        deadline_time=deadline_time,
        items=items,
        customs_required=True,
    )

    # Candidate Transport Options
    options = [
        # OPTION 1: Dedicated Air Freighter (Jet-A1) - Fast, highest emissions, expensive
        TransportOption(
            id="OPT-AIR-CHARTER-01",
            name="DHL Motorsport B777F Direct Charter (Jet-A1)",
            carrier="DHL Global Motorsport",
            primary_mode=TransportMode.AIR_CHARTER,
            max_weight_capacity_kg=102000.0,
            max_volume_capacity_m3=650.0,
            supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES, HazmatClass.CLASS_3_FLAMMABLE_LIQUIDS],
            supports_temperature_control=True,
            customs_handling_hours=4.0,
            origin_handling_hours=3.0,
            destination_drayage_hours=3.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-MEL-PVG-DIR",
                    origin_code="MEL",
                    destination_code="PVG",
                    mode=TransportMode.AIR_CHARTER,
                    fuel_type=FuelType.JET_A1_CONVENTIONAL,
                    carrier_name="DHL Aviation",
                    distance_km=8050.0,
                    transit_hours=11.5,
                    dwell_hours=2.0,
                )
            ],
            description="Dedicated charter flight direct to Shanghai. Rapid delivery but heavy carbon footprint.",
        ),

        # OPTION 2: Commercial Air Cargo with 30% SAF blend via Singapore Changi Hub
        TransportOption(
            id="OPT-AIR-SAF-02",
            name="Singapore Airlines Cargo 30% SAF Blend (via SIN)",
            carrier="SIA Cargo / F1 Partner",
            primary_mode=TransportMode.AIR_COMMERCIAL,
            max_weight_capacity_kg=45000.0,
            max_volume_capacity_m3=280.0,
            supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES],
            supports_temperature_control=True,
            customs_handling_hours=5.0,
            origin_handling_hours=4.0,
            destination_drayage_hours=4.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-MEL-SIN",
                    origin_code="MEL",
                    destination_code="SIN",
                    mode=TransportMode.AIR_COMMERCIAL,
                    fuel_type=FuelType.SAF_30_BLEND,
                    carrier_name="Singapore Airlines Cargo",
                    distance_km=6030.0,
                    transit_hours=8.5,
                    dwell_hours=6.0,
                ),
                RouteLeg(
                    leg_id="LEG-SIN-PVG",
                    origin_code="SIN",
                    destination_code="PVG",
                    mode=TransportMode.AIR_COMMERCIAL,
                    fuel_type=FuelType.SAF_30_BLEND,
                    carrier_name="Singapore Airlines Cargo",
                    distance_km=3800.0,
                    transit_hours=5.5,
                    dwell_hours=3.0,
                ),
            ],
            description="Scheduled commercial cargo with 30% SAF blend. Significant emissions reduction.",
        ),

        # OPTION 3: Ocean Express Container Vessel -> INFEASIBLE (Deadline Exceeded: ~380 hours vs 96h available)
        TransportOption(
            id="OPT-SEA-CONTAINER-03",
            name="Maersk Ocean Express Container (Port of Melbourne to Shanghai Port)",
            carrier="Maersk Line",
            primary_mode=TransportMode.SEA_CONTAINER,
            max_weight_capacity_kg=28000.0,
            max_volume_capacity_m3=76.0,
            supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES, HazmatClass.CLASS_3_FLAMMABLE_LIQUIDS],
            supports_temperature_control=True,
            customs_handling_hours=24.0,
            origin_handling_hours=12.0,
            destination_drayage_hours=8.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-SEA-MEL-PVG",
                    origin_code="MEL",
                    destination_code="PVG",
                    mode=TransportMode.SEA_CONTAINER,
                    fuel_type=FuelType.VLSFO_MARINE,
                    carrier_name="Maersk Maritime",
                    distance_km=9400.0,
                    transit_hours=340.0,
                    dwell_hours=48.0,
                )
            ],
            description="Ocean container vessel. Super green, but takes 16 days. Infeasible for race cars.",
        ),

        # OPTION 4: Commercial Passenger Belly Hold -> INFEASIBLE (Rejects Hazmat Class 9 high-capacity batteries)
        TransportOption(
            id="OPT-AIR-PASSENGER-04",
            name="Qantas Belly Freight Scheduled (MEL -> PVG)",
            carrier="Qantas Freight",
            primary_mode=TransportMode.AIR_COMMERCIAL,
            max_weight_capacity_kg=8000.0,
            max_volume_capacity_m3=35.0,
            supported_hazmat=[HazmatClass.NONE],  # No dangerous goods on passenger flights!
            supports_temperature_control=True,
            customs_handling_hours=6.0,
            origin_handling_hours=4.0,
            destination_drayage_hours=4.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-AIR-PAX-MEL-PVG",
                    origin_code="MEL",
                    destination_code="PVG",
                    mode=TransportMode.AIR_COMMERCIAL,
                    fuel_type=FuelType.JET_A1_CONVENTIONAL,
                    carrier_name="Qantas",
                    distance_km=8050.0,
                    transit_hours=11.5,
                    dwell_hours=4.0,
                )
            ],
            description="Passenger belly-hold cargo. Ineligible due to UN Class 9 battery safety restrictions.",
        ),

        # OPTION 5: Light Air Cargo Express (Feeder Turboprop) -> INFEASIBLE (Exceeds payload capacity: 2500kg max vs 3800kg)
        TransportOption(
            id="OPT-AIR-FEEDER-05",
            name="Regional Express Air Charter",
            carrier="Regional Air Express",
            primary_mode=TransportMode.AIR_CHARTER,
            max_weight_capacity_kg=2500.0,  # 2.5 tonnes capacity << 3.8 tonnes
            max_volume_capacity_m3=18.0,
            supported_hazmat=[HazmatClass.CLASS_9_LITHIUM_BATTERIES],
            supports_temperature_control=True,
            legs=[
                RouteLeg(
                    leg_id="LEG-FEEDER-MEL-PVG",
                    origin_code="MEL",
                    destination_code="PVG",
                    mode=TransportMode.AIR_CHARTER,
                    fuel_type=FuelType.JET_A1_CONVENTIONAL,
                    carrier_name="Regional Express",
                    distance_km=8050.0,
                    transit_hours=18.0,
                    dwell_hours=6.0,
                )
            ],
            description="Small feeder aircraft. Ineligible due to insufficient gross weight capacity.",
        ),
    ]

    disruptions = [
        DisruptionEvent(
            id="DISR-HKG-TYPHOON",
            title="Tropical Depression alert near Hong Kong / South China Sea",
            category=DisruptionCategory.EXTREME_WEATHER,
            severity=DisruptionSeverity.LOW,
            affected_corridors=["SOUTH_CHINA_SEA_AIRSPACE"],
            affected_modes=[TransportMode.AIR_COMMERCIAL],
            delay_hours=2.5,
            active=False,  # Inactive currently
        )
    ]

    return shipment, options, disruptions


def get_miami_to_imola_scenario() -> Tuple[Shipment, List[TransportOption], List[DisruptionEvent]]:
    """
    Scenario 2: Paddock Sea Kit, Hospitality & Pit Gantries
    Route: Miami International Autodrome -> Imola (Emilia Romagna GP)
    Large 42,000 kg consignment. 21-day (504 hours) available window.
    Features active Red Sea / Suez canal maritime disruption.
    """
    ready_time = datetime(2026, 5, 4, 18, 0)
    deadline_time = ready_time + timedelta(hours=504)

    items = [
        CargoItem(
            id="CRG-HOSP-01",
            name="Motorhome Hospitality Kitchen Units & Refrigeration",
            category=CargoCategory.HOSPITALITY_SEA_KIT,
            priority=CargoPriority.STANDARD_P3,
            weight_kg=22000.0,
            volume_m3=85.0,
            hazmat_class=HazmatClass.NONE,
        ),
        CargoItem(
            id="CRG-PIT-02",
            name="Pit Wall Gantry Rigging, Tool Chests & Overhead Gantries",
            category=CargoCategory.GARAGE_INFRASTRUCTURE,
            priority=CargoPriority.ESSENTIAL_P2,
            weight_kg=20000.0,
            volume_m3=75.0,
            hazmat_class=HazmatClass.NONE,
        ),
    ]

    shipment = Shipment(
        id="F1-SHP-MIA-BLQ-2026",
        title="Miami to Imola: Sea Kit 2 & Hospitality Infrastructure",
        origin_code="MIA",
        origin_name="Miami Gardens / Port of Miami",
        destination_code="BLQ",
        destination_name="Imola Autodromo / Bologna Logistics Hub",
        ready_time=ready_time,
        deadline_time=deadline_time,
        items=items,
        customs_required=True,
    )

    # Active Disruption: Suez Canal / Red Sea Security Threat (Critical Block for that corridor)
    disruptions = [
        DisruptionEvent(
            id="DISR-REDSEA-2026",
            title="Red Sea & Bab-el-Mandeb Maritime War Risk Closure",
            category=DisruptionCategory.CANAL_CHOKEPOINT,
            severity=DisruptionSeverity.CRITICAL,
            affected_corridors=["RED_SEA", "SUEZ_CANAL"],
            affected_modes=[TransportMode.SEA_CONTAINER],
            delay_hours=168.0,
            completely_blocked=True,
            active=True,
            description="Attacks in Bab-el-Mandeb completely halt commercial transits through Suez.",
        )
    ]

    options = [
        # OPTION 1: Transatlantic Ocean Freight (Miami to Genoa) + Biofuel HVO100 Road Truck to Imola
        TransportOption(
            id="OPT-SEA-GENOA-HVO-01",
            name="Hapag-Lloyd Ocean to Genoa + HVO100 Biofuel Drayage to Imola",
            carrier="Hapag-Lloyd / Ferrari Logistics",
            primary_mode=TransportMode.MULTIMODAL,
            max_weight_capacity_kg=60000.0,
            max_volume_capacity_m3=240.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=18.0,
            origin_handling_hours=12.0,
            destination_drayage_hours=6.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-MIA-GENOA-SEA",
                    origin_code="MIA",
                    destination_code="GOA",
                    mode=TransportMode.SEA_CONTAINER,
                    fuel_type=FuelType.VLSFO_MARINE,
                    carrier_name="Hapag-Lloyd Transatlantic",
                    distance_km=8200.0,
                    transit_hours=310.0,
                    dwell_hours=36.0,
                    corridors=["NORTH_ATLANTIC", "STRAIT_OF_GIBRALTAR"],
                ),
                RouteLeg(
                    leg_id="LEG-GENOA-IMOLA-ROAD",
                    origin_code="GOA",
                    destination_code="BLQ",
                    mode=TransportMode.ROAD_TRUCK,
                    fuel_type=FuelType.HVO100_BIOFUEL,
                    carrier_name="Autamarocchi HVO Fleet",
                    distance_km=310.0,
                    transit_hours=5.5,
                    dwell_hours=2.0,
                ),
            ],
            description="Transatlantic direct to Genoa avoiding Red Sea, followed by low-carbon HVO100 trucking.",
        ),

        # OPTION 2: Transatlantic Ocean (Miami to Rotterdam) + Electric Rail Freight to Bologna
        TransportOption(
            id="OPT-SEA-ROT-RAIL-02",
            name="Maersk Ocean to Rotterdam + Intermodal Electric Rail to Bologna Hub",
            carrier="Maersk Intermodal / Lineas",
            primary_mode=TransportMode.MULTIMODAL,
            max_weight_capacity_kg=55000.0,
            max_volume_capacity_m3=220.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=20.0,
            origin_handling_hours=12.0,
            destination_drayage_hours=8.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-MIA-RTM-SEA",
                    origin_code="MIA",
                    destination_code="RTM",
                    mode=TransportMode.SEA_CONTAINER,
                    fuel_type=FuelType.VLSFO_MARINE,
                    carrier_name="Maersk North Atlantic",
                    distance_km=7600.0,
                    transit_hours=285.0,
                    dwell_hours=40.0,
                    corridors=["NORTH_ATLANTIC", "ENGLISH_CHANNEL"],
                ),
                RouteLeg(
                    leg_id="LEG-RTM-BLQ-RAIL",
                    origin_code="RTM",
                    destination_code="BLQ",
                    mode=TransportMode.RAIL_FREIGHT,
                    fuel_type=FuelType.ELECTRIC_GRID,
                    carrier_name="Green Cargo Intermodal",
                    distance_km=1250.0,
                    transit_hours=24.0,
                    dwell_hours=6.0,
                ),
            ],
            description="Rotterdam port discharge with zero-tailpipe electric rail across the Alps.",
        ),

        # OPTION 3: Dedicated Full Boeing 747-8F Air Cargo Charter -> Feasible but heavily penalized on CO2 and Cost
        TransportOption(
            id="OPT-AIR-HEAVY-03",
            name="Atlas Air Boeing 747-8F Heavy Charter (MIA direct to BLQ)",
            carrier="Atlas Air Worldwide",
            primary_mode=TransportMode.AIR_CHARTER,
            max_weight_capacity_kg=130000.0,
            max_volume_capacity_m3=850.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=6.0,
            origin_handling_hours=6.0,
            destination_drayage_hours=4.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-MIA-BLQ-AIR",
                    origin_code="MIA",
                    destination_code="BLQ",
                    mode=TransportMode.AIR_CHARTER,
                    fuel_type=FuelType.JET_A1_CONVENTIONAL,
                    carrier_name="Atlas Air",
                    distance_km=8100.0,
                    transit_hours=11.0,
                    dwell_hours=4.0,
                )
            ],
            description="Complete dedicated air charter. Fast (28h), but consumes vast fuel and budget.",
        ),

        # OPTION 4: Route traversing Suez Canal -> INFEASIBLE (Blocked by active Critical Disruption)
        TransportOption(
            id="OPT-SEA-SUEZ-BLOCKED-04",
            name="Middle East Feeder Sea Route via Suez Canal",
            carrier="Eastern Maritime Lines",
            primary_mode=TransportMode.SEA_CONTAINER,
            max_weight_capacity_kg=50000.0,
            max_volume_capacity_m3=200.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            legs=[
                RouteLeg(
                    leg_id="LEG-SUEZ-CORRIDOR",
                    origin_code="MIA",
                    destination_code="BLQ",
                    mode=TransportMode.SEA_CONTAINER,
                    fuel_type=FuelType.VLSFO_MARINE,
                    carrier_name="Eastern Lines",
                    distance_km=11200.0,
                    transit_hours=420.0,
                    dwell_hours=48.0,
                    corridors=["RED_SEA", "SUEZ_CANAL"],  # Blocked!
                )
            ],
            description="Route attempting Suez corridor transit. Disqualified by active naval closure.",
        ),
    ]

    return shipment, options, disruptions


def get_european_double_header_scenario() -> Tuple[Shipment, List[TransportOption], List[DisruptionEvent]]:
    """
    Scenario 3: European Double Header (Spa-Francorchamps to Zandvoort)
    Ground transport across Benelux corridor. 72-hour window.
    Compares HVO100 Renewable Biofuel Trucking vs Standard Diesel vs Electric Rail.
    """
    ready_time = datetime(2026, 8, 30, 20, 0)
    deadline_time = ready_time + timedelta(hours=72)

    items = [
        CargoItem(
            id="CRG-GARAGE-SPA",
            name="Team Transporters, Pit Garage Infrastructure & Tool Stations",
            category=CargoCategory.GARAGE_INFRASTRUCTURE,
            priority=CargoPriority.ESSENTIAL_P2,
            weight_kg=28000.0,
            volume_m3=110.0,
            hazmat_class=HazmatClass.NONE,
        )
    ]

    shipment = Shipment(
        id="F1-SHP-SPA-ZAN-2026",
        title="Spa to Zandvoort: European Leg Garage Convoy",
        origin_code="SPA",
        origin_name="Circuit de Spa-Francorchamps, Stavelot, Belgium",
        destination_code="ZAN",
        destination_name="Circuit Zandvoort, North Holland, Netherlands",
        ready_time=ready_time,
        deadline_time=deadline_time,
        items=items,
        customs_required=False,  # Intra-EU Schengen area
    )

    options = [
        # OPTION 1: 100% HVO100 Renewable Biofuel Truck Fleet
        TransportOption(
            id="OPT-ROAD-HVO-01",
            name="DHL 100% HVO100 Biofuel Mega-Trailer Fleet",
            carrier="DHL Motorsports European Fleet",
            primary_mode=TransportMode.ROAD_TRUCK,
            max_weight_capacity_kg=40000.0,
            max_volume_capacity_m3=140.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=0.0,
            origin_handling_hours=3.0,
            destination_drayage_hours=2.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-SPA-ZAN-HVO",
                    origin_code="SPA",
                    destination_code="ZAN",
                    mode=TransportMode.ROAD_TRUCK,
                    fuel_type=FuelType.HVO100_BIOFUEL,
                    carrier_name="DHL Freight Green",
                    distance_km=340.0,
                    transit_hours=5.5,
                    dwell_hours=1.5,
                )
            ],
            description="Low-emission HVO100 certified biofuel trucking fleet. ~85% lifecycle GHG reduction.",
        ),

        # OPTION 2: Standard Diesel Convoy
        TransportOption(
            id="OPT-ROAD-DIESEL-02",
            name="Standard Euro 6 Diesel Convoy",
            carrier="Contracted European Haulier",
            primary_mode=TransportMode.ROAD_TRUCK,
            max_weight_capacity_kg=40000.0,
            max_volume_capacity_m3=140.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=0.0,
            origin_handling_hours=3.0,
            destination_drayage_hours=2.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-SPA-ZAN-DSL",
                    origin_code="SPA",
                    destination_code="ZAN",
                    mode=TransportMode.ROAD_TRUCK,
                    fuel_type=FuelType.DIESEL_STANDARD,
                    carrier_name="Euro Haulage",
                    distance_km=340.0,
                    transit_hours=5.5,
                    dwell_hours=1.5,
                )
            ],
            description="Conventional fossil diesel trucking. Standard baseline cost, but high road emissions.",
        ),

        # OPTION 3: Intermodal Electric Rail (Liege to Amsterdam) + Local Electric Drayage
        TransportOption(
            id="OPT-RAIL-ELECTRIC-03",
            name="Intermodal Green Rail (Liege Marshalling -> Amsterdam -> Zandvoort)",
            carrier="DB Cargo Green Intermodal",
            primary_mode=TransportMode.RAIL_FREIGHT,
            max_weight_capacity_kg=60000.0,
            max_volume_capacity_m3=200.0,
            supported_hazmat=[HazmatClass.NONE],
            supports_temperature_control=True,
            customs_handling_hours=0.0,
            origin_handling_hours=4.0,
            destination_drayage_hours=3.0,
            legs=[
                RouteLeg(
                    leg_id="LEG-LIEGE-AMS-RAIL",
                    origin_code="LGG",
                    destination_code="AMS",
                    mode=TransportMode.RAIL_FREIGHT,
                    fuel_type=FuelType.ELECTRIC_GRID,
                    carrier_name="DB Cargo Electric",
                    distance_km=280.0,
                    transit_hours=8.0,
                    dwell_hours=4.0,
                ),
                RouteLeg(
                    leg_id="LEG-AMS-ZAN-DRAY",
                    origin_code="AMS",
                    destination_code="ZAN",
                    mode=TransportMode.ROAD_TRUCK,
                    fuel_type=FuelType.HVO100_BIOFUEL,
                    carrier_name="Local Zero-Emission Drayage",
                    distance_km=40.0,
                    transit_hours=1.0,
                    dwell_hours=1.0,
                ),
            ],
            description="Zero-tailpipe electric rail across the Dutch-Belgian border with HVO drayage.",
        ),
    ]

    disruptions: List[DisruptionEvent] = []
    return shipment, options, disruptions
