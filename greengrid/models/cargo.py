"""
Cargo and Shipment Domain Models for GreenGrid
Handles Formula 1 freight classifications, Hazmat compliance, and shipment constraints.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, computed_field


class HazmatClass(str, Enum):
    """UN Dangerous Goods Hazard Classification."""
    NONE = "NONE"
    CLASS_3_FLAMMABLE_LIQUIDS = "CLASS_3_FLAMMABLE_LIQUIDS"      # F1 Race Fuel / Lubricants
    CLASS_9_LITHIUM_BATTERIES = "CLASS_9_LITHIUM_BATTERIES"      # Hybrid Energy Store (ES / ERS-K)
    CLASS_2_COMPRESSED_GAS = "CLASS_2_COMPRESSED_GAS"            # Pit gantry pneumatic gas
    CLASS_8_CORROSIVES = "CLASS_8_CORROSIVES"                    # Specialized cleaning / chemical agents


class CargoPriority(str, Enum):
    """Urgency / Criticality of cargo for race weekend operations."""
    CRITICAL_P1 = "P1_CRITICAL"       # Cars, Engines, Spare Chassis, Telemetry (Must arrive for scrutineering)
    ESSENTIAL_P2 = "P2_ESSENTIAL"     # Pit gantry, Garage tools, Spare wings
    STANDARD_P3 = "P3_STANDARD"       # Sea kits, Hospitality, Branding, Consumables


class CargoCategory(str, Enum):
    """Formula 1 Cargo Category."""
    RACE_CAR = "RACE_CAR"
    POWER_UNIT = "POWER_UNIT"
    CHASSIS_SPARES = "CHASSIS_SPARES"
    TELEMETRY_ELECTRONICS = "TELEMETRY_ELECTRONICS"
    TIRES = "TIRES"
    FUEL_AND_LUBRICANTS = "FUEL_AND_LUBRICANTS"
    GARAGE_INFRASTRUCTURE = "GARAGE_INFRASTRUCTURE"
    HOSPITALITY_SEA_KIT = "HOSPITALITY_SEA_KIT"
    GENERAL_FREIGHT = "GENERAL_FREIGHT"


class CargoItem(BaseModel):
    """Individual cargo unit in a consignment."""
    id: str = Field(..., description="Unique cargo identifier")
    name: str = Field(..., description="Item name or description")
    category: CargoCategory = Field(default=CargoCategory.GENERAL_FREIGHT)
    priority: CargoPriority = Field(default=CargoPriority.ESSENTIAL_P2)
    weight_kg: float = Field(gt=0, description="Gross weight in kilograms")
    volume_m3: float = Field(gt=0, description="Volume in cubic meters")
    hazmat_class: HazmatClass = Field(default=HazmatClass.NONE)
    declared_value_usd: float = Field(default=0.0, ge=0)
    requires_temperature_control: bool = Field(default=False)
    stackable: bool = Field(default=True)


class Shipment(BaseModel):
    """Complete consignment moving between Grand Prix destinations."""
    id: str = Field(..., description="Shipment tracking identifier (e.g. 'F1-SHP-2026-04')")
    title: str = Field(..., description="Summary of shipment")
    origin_code: str = Field(..., description="IATA/UN-LOCODE (e.g. 'MEL', 'MIA')")
    origin_name: str = Field(..., description="Full origin location name")
    destination_code: str = Field(..., description="IATA/UN-LOCODE (e.g. 'PVG', 'BLQ')")
    destination_name: str = Field(..., description="Full destination location name")
    ready_time: datetime = Field(..., description="Timestamp when cargo is packed and ready at origin")
    deadline_time: datetime = Field(..., description="Hard deadline: Scrutineering / Paddock gate cutoff")
    items: List[CargoItem] = Field(default_factory=list, description="Items included in shipment")
    customs_required: bool = Field(default=True, description="Whether international customs clearance applies")

    @computed_field
    @property
    def total_weight_kg(self) -> float:
        return sum(item.weight_kg for item in self.items)

    @computed_field
    @property
    def total_weight_tonnes(self) -> float:
        return self.total_weight_kg / 1000.0

    @computed_field
    @property
    def total_volume_m3(self) -> float:
        return sum(item.volume_m3 for item in self.items)

    @computed_field
    @property
    def has_hazmat(self) -> bool:
        return any(item.hazmat_class != HazmatClass.NONE for item in self.items)

    @computed_field
    @property
    def hazmat_classes(self) -> List[HazmatClass]:
        return list({item.hazmat_class for item in self.items if item.hazmat_class != HazmatClass.NONE})

    @computed_field
    @property
    def max_priority(self) -> CargoPriority:
        if any(item.priority == CargoPriority.CRITICAL_P1 for item in self.items):
            return CargoPriority.CRITICAL_P1
        if any(item.priority == CargoPriority.ESSENTIAL_P2 for item in self.items):
            return CargoPriority.ESSENTIAL_P2
        return CargoPriority.STANDARD_P3

    @property
    def available_hours(self) -> float:
        """Total hours between ready time and deadline."""
        delta = self.deadline_time - self.ready_time
        return max(0.0, delta.total_seconds() / 3600.0)
