// GreenGrid Admin Portal Domain Models

export interface Shipment {
  shipment_id: string;
  use_case_type: "F1_Demonstration" | "Commercial_General" | string;
  leg_number?: number | null;
  origin_round?: number | null;
  origin_name: string;
  origin_circuit: string;
  origin_facility: string;
  origin_country: string;
  origin_lat?: number | null;
  origin_lon?: number | null;
  origin_region: string;
  destination_round?: number | null;
  destination_name: string;
  destination_circuit: string;
  destination_facility: string;
  destination_country: string;
  destination_lat?: number | null;
  destination_lon?: number | null;
  destination_region: string;
  great_circle_km?: number | null;
  cargo_weight_tonnes: number;
  cargo_description: string;
  weight_provenance?: string;
  departure_date: string;
  delivery_deadline: string;
  available_window_days: number;
  notes?: string;
  dataset_version?: string;
}

export interface Disruption {
  disruption_id: string;
  title: string;
  type: string;
  affected_mode: "Air" | "Road" | "Rail" | "Sea" | string;
  geographic_corridor: string;
  delay_impact_days: number;
  cost_surcharge_usd: number;
  emissions_increase_pct: number;
  description: string;
  status: string;
  mitigation_mode: string;
  dataset_version?: string;
}

export interface TransportOption {
  option_id: string;
  shipment_id: string;
  use_case_type?: string;
  mode: "Air" | "Road" | "Rail" | "Sea" | string;
  feasibility_status: "Feasible" | "Infeasible" | string;
  feasibility_reason: string;
  route_distance_km: number | null;
  circuity_multiplier?: number | null;
  transit_time_days: number | null;
  estimated_arrival_date: string;
  meets_deadline: boolean | null;
  deadline_margin_days: number | null;
  fixed_cost_usd: number | null;
  distance_cost_usd: number | null;
  total_cost_usd: number | null;
  emission_factor_kg_per_tkm?: number;
  total_emissions_tco2e: number | null;
  composite_score: number | null;
  is_recommended: boolean;
  data_confidence?: string;
  cost_status?: string;
  dataset_version?: string;
}

export interface AdminShipment extends Shipment {
  status: "Active" | "Suspended" | "Completed" | "Draft";
}

export interface AdminDisruption extends Disruption {
  status: "Active" | "Inactive" | "Simulated Active Scenario";
  is_custom?: boolean;
}

export interface EmissionFactorConfig {
  mode: "Air" | "Road" | "Rail" | "Sea";
  factor_kg_per_tkm: number;
  standard: string;
  circuity_default: number;
  base_cost_per_km: number;
  last_updated: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  corridor_id: string;
  disruption_id: string | null;
  recommended_mode: string;
  latency_ms: number;
  status: "Optimized" | "Rerouted" | "Infeasible_Fallback";
  emissions_kg: number;
}
