from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ShipmentModel(BaseModel):
    shipment_id: str = Field(..., description="Unique shipment identifier, e.g. SHP-01 or COMM-01")
    use_case_type: str = Field(..., description="Operational domain classification: F1_Demonstration or Commercial_General")
    leg_number: Optional[int] = Field(None, description="Chronological leg sequence (1-23 for F1, null for commercial)")
    origin_round: Optional[int] = Field(None, description="Origin round number for F1 (1-24, null for commercial)")
    origin_name: str = Field(..., description="Origin location city/name")
    origin_circuit: Optional[str] = Field(None, description="Origin circuit name")
    origin_facility: Optional[str] = Field(None, description="Origin facility name")
    origin_country: str = Field(..., description="Origin country")
    origin_lat: float = Field(..., description="Origin latitude")
    origin_lon: float = Field(..., description="Origin longitude")
    origin_region: str = Field(..., description="Origin geographical region")
    destination_round: Optional[int] = Field(None, description="Destination round number for F1")
    destination_name: str = Field(..., description="Destination location city/name")
    destination_circuit: Optional[str] = Field(None, description="Destination circuit name")
    destination_facility: Optional[str] = Field(None, description="Destination facility name")
    destination_country: str = Field(..., description="Destination country")
    destination_lat: float = Field(..., description="Destination latitude")
    destination_lon: float = Field(..., description="Destination longitude")
    destination_region: str = Field(..., description="Destination geographical region")
    great_circle_km: int = Field(..., description="Great-circle distance in kilometers")
    cargo_weight_tonnes: float = Field(..., description="Total cargo weight in metric tonnes")
    cargo_description: str = Field(..., description="Description of freight items")
    weight_provenance: Optional[str] = Field(None, description="Data provenance note")
    departure_date: str = Field(..., description="Departure date (YYYY-MM-DD)")
    delivery_deadline: str = Field(..., description="Delivery deadline date (YYYY-MM-DD)")
    available_window_days: float = Field(..., description="Total allowable transit window in days")
    notes: Optional[str] = Field(None, description="Operational notes")
    dataset_version: str = Field(default="2.1.1", description="Dataset release version")

class TransportOptionModel(BaseModel):
    option_id: str = Field(..., description="Unique option identifier, e.g. OPT-SHP-01-AIR")
    shipment_id: str = Field(..., description="Associated shipment identifier")
    use_case_type: str = Field(..., description="Operational domain classification")
    mode: str = Field(..., description="Transport mode: Air, Road, Rail, Sea")
    feasibility_status: str = Field(..., description="Feasibility classification: Feasible or Infeasible")
    feasibility_reason: Optional[str] = Field(None, description="Operational feasibility rationale")
    route_distance_km: Optional[int] = Field(None, description="Calculated route distance in km. Null/None if infeasible.")
    circuity_multiplier: Optional[float] = Field(None, description="Circuity factor applied. Null/None if infeasible.")
    transit_time_days: Optional[float] = Field(None, description="Total transit duration in days. Null/None if infeasible.")
    estimated_arrival_date: Optional[str] = Field(None, description="Estimated arrival date (YYYY-MM-DD). Null/None if infeasible.")
    meets_deadline: Optional[bool] = Field(None, description="True if estimated arrival meets delivery deadline. Null/None if infeasible.")
    deadline_margin_days: Optional[float] = Field(None, description="Days buffer before deadline (positive=early, negative=late). Null/None if infeasible.")
    fixed_cost_usd: Optional[float] = Field(None, description="Fixed handling cost in USD. Null/None if infeasible.")
    distance_cost_usd: Optional[float] = Field(None, description="Variable distance cost in USD. Null/None if infeasible.")
    total_cost_usd: Optional[float] = Field(None, description="Total freight cost in USD. Null/None if infeasible.")
    emission_factor_kg_per_tkm: Optional[float] = Field(None, description="Emission factor in kg CO2e / tonne-km. Null/None if infeasible.")
    total_emissions_tco2e: Optional[float] = Field(None, description="Total carbon emissions in metric tonnes CO2e. Null/None if infeasible.")
    composite_score: Optional[float] = Field(None, description="Multi-criteria composite score (0-100). Null/None if infeasible.")
    is_recommended: Optional[bool] = Field(None, description="True if recommended candidate option. Null/None if infeasible.")
    data_confidence: Optional[str] = Field(None, description="Confidence categorization")
    cost_status: Optional[str] = Field(None, description="Cost status classification")
    dataset_version: str = Field(default="2.1.1", description="Dataset release version")

class DisruptionModel(BaseModel):
    disruption_id: str = Field(..., description="Unique disruption identifier, e.g. DIS-01")
    title: str = Field(..., description="Descriptive headline of disruption")
    type: str = Field(..., description="Disruption classification type")
    affected_mode: str = Field(..., description="Primary affected transport mode")
    geographic_corridor: str = Field(..., description="Corridor or passage impacted")
    delay_impact_days: float = Field(..., description="Operational delay added in days")
    cost_surcharge_usd: float = Field(..., description="Emergency cost surcharge in USD")
    emissions_increase_pct: float = Field(..., description="Percentage emissions increase")
    description: str = Field(..., description="Detailed narrative description")
    status: str = Field(..., description="Status, e.g. Simulated Active Scenario")
    mitigation_mode: Optional[str] = Field(None, description="Recommended alternative mode")
    dataset_version: str = Field(default="2.1.1", description="Dataset release version")

class ScenarioTestModel(BaseModel):
    test_case_id: str = Field(..., description="Test case identifier, e.g. TC-01")
    domain: str = Field(..., description="Domain classification")
    scenario_name: str = Field(..., description="Name of test scenario")
    shipment_id: str = Field(..., description="Target shipment identifier")
    origin: str = Field(..., description="Origin location")
    destination: str = Field(..., description="Destination location")
    disruption_id: str = Field(..., description="Associated disruption ID")
    tested_mode: str = Field(..., description="Mode tested under disruption")
    baseline_mode: str = Field(..., description="Baseline recommended mode")
    baseline_transit_days: float = Field(..., description="Baseline transit duration in days")
    baseline_cost_usd: float = Field(..., description="Baseline cost in USD")
    baseline_emissions_tco2e: float = Field(..., description="Baseline emissions in tCO2e")
    baseline_deadline_met: bool = Field(..., description="Whether baseline met deadline")
    disrupted_mode: str = Field(..., description="Disrupted mode description")
    disrupted_transit_days: float = Field(..., description="Disrupted transit duration in days")
    disrupted_cost_usd: float = Field(..., description="Disrupted cost in USD")
    disrupted_emissions_tco2e: float = Field(..., description="Disrupted emissions in tCO2e")
    disrupted_deadline_met: bool = Field(..., description="Whether disrupted option meets deadline")
    recommended_action: str = Field(..., description="Recommended mitigation action")
    explanation: str = Field(..., description="Detailed operational rationale")
    dataset_version: str = Field(default="2.1.1", description="Dataset release version")

class HealthStatus(BaseModel):
    status: str = "ok"
    service: str = "data-service"
    version: str = "2.1.1"
    dataset_version: str = "Version 2.1.1 (Official Frozen Dataset)"
    dataset_status: str = "verified"
    data_directory: str
    loaded_records: Dict[str, int]
    expected_records: Dict[str, int]
    integrity_verified: bool
