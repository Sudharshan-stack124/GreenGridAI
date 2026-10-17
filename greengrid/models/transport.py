"""
Transport and Route Domain Models for GreenGrid
Defines multimodal legs, vehicle capacity, fuel types, and route options.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, computed_field
from greengrid.models.cargo import HazmatClass


class TransportMode(str, Enum):
    """Transport modalities available in global supply chains."""
    AIR_CHARTER = "AIR_CHARTER"          # Dedicated freighter (e.g. Boeing 777F) - fastest, highest emissions
    AIR_COMMERCIAL = "AIR_COMMERCIAL"    # Scheduled commercial belly/cargo hold
    SEA_CONTAINER = "SEA_CONTAINER"      # Ocean freight container vessel - ultra-low emissions, very slow
    ROAD_TRUCK = "ROAD_TRUCK"            # Heavy Duty Vehicle / Mega-trailer
    RAIL_FREIGHT = "RAIL_FREIGHT"        # Electric / Diesel intermodal rail
    MULTIMODAL = "MULTIMODAL"            # Combined (e.g. Sea + Rail + Road or Air + Biofuel Truck)


class FuelType(str, Enum):
    """Energy and propulsion fuel types with distinct lifecycle emission factors."""
    JET_A1_CONVENTIONAL = "JET_A1_CONVENTIONAL"   # Standard aviation turbine fuel
    SAF_30_BLEND = "SAF_30_BLEND"                 # 30% Sustainable Aviation Fuel blend (ICAO verified)
    SAF_100 = "SAF_100"                           # 100% Drop-in Sustainable Aviation Fuel
    DIESEL_STANDARD = "DIESEL_STANDARD"           # Ultra-low sulfur diesel (EN 590)
    HVO100_BIOFUEL = "HVO100_BIOFUEL"             # 100% Hydrotreated Vegetable Oil (reduces net GHG by ~85-90%)
    ELECTRIC_GRID = "ELECTRIC_GRID"               # European / regional rail electric traction
    VLSFO_MARINE = "VLSFO_MARINE"                 # Very Low Sulfur Fuel Oil for ocean carriers
    LNG_MARINE = "LNG_MARINE"                     # Liquefied Natural Gas marine fuel


class RouteLeg(BaseModel):
    """A single leg within a transport corridor."""
    leg_id: str = Field(..., description="Leg identifier (e.g. 'LEG-MEL-SIN')")
    origin_code: str
    destination_code: str
    mode: TransportMode
    fuel_type: FuelType
    carrier_name: str
    distance_km: float = Field(gt=0, description="Great circle / actual route distance in km")
    transit_hours: float = Field(gt=0, description="Cruising / travel time in hours")
    dwell_hours: float = Field(default=0.0, ge=0, description="Handling, cross-dock, or customs dwell")
    calculated_cost_usd: Optional[float] = None
    calculated_co2e_kg: Optional[float] = None
    corridors: List[str] = Field(default_factory=list, description="Strategic chokepoints/corridors passed")

    @computed_field
    @property
    def total_leg_hours(self) -> float:
        return self.transit_hours + self.dwell_hours


class TransportOption(BaseModel):
    """Candidate transport route evaluated by GreenGrid Decision Engine."""
    id: str = Field(..., description="Unique option identifier (e.g. 'OPT-AIR-EXPRESS-01')")
    name: str = Field(..., description="Readable option label")
    carrier: str = Field(..., description="Primary logistics operator (e.g. 'DHL Motorsport', 'F1 Global Cargo')")
    primary_mode: TransportMode
    legs: List[RouteLeg] = Field(default_factory=list)
    max_weight_capacity_kg: float = Field(gt=0, description="Vehicle / flight max payload in kg")
    max_volume_capacity_m3: float = Field(gt=0, description="Usable volumetric capacity in m3")
    supported_hazmat: List[HazmatClass] = Field(
        default_factory=lambda: [HazmatClass.NONE],
        description="Dangerous goods categories authorized by this carrier/mode"
    )
    supports_temperature_control: bool = Field(default=True)
    customs_handling_hours: float = Field(default=6.0, ge=0, description="Origin/dest customs clearance time")
    origin_handling_hours: float = Field(default=4.0, ge=0, description="Paddock pack-up and warehouse handling")
    destination_drayage_hours: float = Field(default=4.0, ge=0, description="Final mile delivery to circuit paddock")

    # Upstream supplied metrics (optional, verified or computed by GreenGrid)
    supplied_cost_usd: Optional[float] = None
    supplied_transit_hours: Optional[float] = None
    supplied_co2e_kg: Optional[float] = None

    # Validated / computed metrics populated by Decision Engine
    validated_cost_usd: Optional[float] = None
    validated_transit_hours: Optional[float] = None
    validated_co2e_kg: Optional[float] = None

    # Metadata
    corridors_traversed: List[str] = Field(default_factory=list)
    description: Optional[str] = None

    @property
    def total_distance_km(self) -> float:
        return sum(leg.distance_km for leg in self.legs)
