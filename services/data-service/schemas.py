from pydantic import BaseModel, Field
from typing import List, Optional

class ShipmentModel(BaseModel):
    shipment_id: str = Field(..., description="Unique shipment identifier, e.g. SHP-F1-001")
    origin: str = Field(..., description="Origin location name")
    destination: str = Field(..., description="Destination location name")
    cargo_category: str = Field(..., description="Category of cargo items")
    total_weight_tons: float = Field(..., gt=0, description="Total weight in metric tons")
    deadline_hours: float = Field(..., gt=0, description="Maximum allowable transit time in hours")
    priority: str = Field(..., description="Priority: critical, high, standard")
    status: str = Field(..., description="Current status: scheduled, in_transit, delivered, delayed")
    data_mode: str = Field(default="synthetic_demo", description="Data source indicator")

class DisruptionModel(BaseModel):
    disruption_id: str = Field(..., description="Unique disruption identifier, e.g. DIS-001")
    title: str = Field(..., description="Descriptive headline of disruption")
    type: str = Field(..., description="Category: chokepoint_delay, weather, labor_dispute, infrastructure, customs_clearance")
    affected_modes: List[str] = Field(..., description="Modes impacted: air, sea, road, rail")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    location_name: str = Field(..., description="Location of disruption")
    delay_hours_impact: float = Field(..., description="Estimated added delay in hours")
    cost_multiplier_impact: float = Field(..., description="Cost impact multiplier, e.g. 1.25")
    description: str = Field(..., description="Detailed description")
    active: bool = Field(..., description="Whether the disruption is currently active")
    data_mode: str = Field(default="synthetic_demo", description="Data source indicator")

class TransportOptionModel(BaseModel):
    option_id: str = Field(..., description="Unique option identifier, e.g. OPT-001")
    shipment_id: str = Field(..., description="Associated shipment identifier")
    mode: str = Field(..., description="Transport mode: air, road, rail, sea, rail_road")
    provider_name: str = Field(..., description="Logistics carrier or operator name")
    transit_time_hours: Optional[float] = Field(None, description="Transit time in hours. Null/None if infeasible or unavailable.")
    cost_usd: Optional[float] = Field(None, description="Cost in USD. Null/None if infeasible or unavailable.")
    emissions_kg_co2e: Optional[float] = Field(None, description="Emissions in kg CO2e. Null/None if infeasible or unavailable.")
    is_feasible: bool = Field(..., description="Whether this transport option meets delivery deadline and operational constraints")
    infeasibility_reason: Optional[str] = Field(None, description="Reason if not feasible")
    disruption_ids: List[str] = Field(default_factory=list, description="Associated disruption IDs impacting this option")
    data_mode: str = Field(default="synthetic_demo", description="Data source indicator")

class HealthStatus(BaseModel):
    status: str = "ok"
    service: str = "data-service"
    version: str = "1.0.0"
    data_mode: str = "synthetic_demo"
    dataset_version: str = "synthetic-demo-v1 (GreenGrid v2.1.1 fallback)"
    loaded_records: dict
