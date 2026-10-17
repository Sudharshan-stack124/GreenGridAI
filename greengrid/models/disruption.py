"""
Disruption Domain Models for GreenGrid
Tracks geopolitical, climatic, and terminal disruptions that affect route feasibility and transit time.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from greengrid.models.transport import TransportMode


class DisruptionCategory(str, Enum):
    """Categorization of supply chain disruption events."""
    GEOPOLITICAL_AIRSPACE = "GEOPOLITICAL_AIRSPACE"       # Airspace closure / detour
    CANAL_CHOKEPOINT = "CANAL_CHOKEPOINT"                 # Red Sea, Suez Canal, Panama Canal blockage
    PORT_STRIKE_CONGESTION = "PORT_STRIKE_CONGESTION"     # Dockworker strikes, berth backlogs
    EXTREME_WEATHER = "EXTREME_WEATHER"                   # Typhoon, blizzard, volcanic ash cloud
    CUSTOMS_BORDER_DISRUPTION = "CUSTOMS_BORDER_DISRUPTION" # Regulatory slowdown / strike
    FUEL_SUPPLY_CRISIS = "FUEL_SUPPLY_CRISIS"             # SAF unavailability, bunker fuel spike


class DisruptionSeverity(str, Enum):
    """Impact severity rating."""
    LOW = "LOW"             # Minor delay (< 6 hours), slight cost impact
    MEDIUM = "MEDIUM"       # Moderate delay (6 - 24 hours)
    HIGH = "HIGH"           # Significant delay (24 - 96 hours), route rerouting required
    CRITICAL = "CRITICAL"   # Route completely severed / forbidden for specific corridor or mode


class DisruptionEvent(BaseModel):
    """Active disruption affecting global freight corridors."""
    id: str = Field(..., description="Unique event identifier (e.g. 'DISR-2026-REDSEA')")
    title: str = Field(..., description="Short headline of the disruption")
    category: DisruptionCategory
    severity: DisruptionSeverity
    affected_corridors: List[str] = Field(default_factory=list, description="Corridors or nodes affected")
    affected_modes: List[TransportMode] = Field(default_factory=list, description="Modes impacted")
    delay_hours: float = Field(default=0.0, ge=0, description="Transit delay introduced if traversing this area")
    cost_penalty_usd: float = Field(default=0.0, ge=0, description="War risk insurance, detour fuel surcharge")
    cost_multiplier: float = Field(default=1.0, ge=1.0, description="Cost inflation factor")
    completely_blocked: bool = Field(default=False, description="If true, forbids any traversal through affected corridors")
    active: bool = Field(default=True)
    description: Optional[str] = None
