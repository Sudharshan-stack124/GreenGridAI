// Official GreenGrid Data Types (Aligned with IBM Z Datathon 2026 Frozen Dataset v2.1.1)

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

  // Aliases for compatibility
  id?: string;
  cargoType?: string;
  origin?: string;
  destination?: string;
  weightKg?: number;
  deadline?: string;
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

  // Aliases
  id?: string;
  name?: string;
  severity?: "low" | "medium" | "high";
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

  // UI convenience aliases
  transitHours?: number | null;
  cost?: number | null;
  currency?: string;
  co2eKg?: number | null;
  note?: string;
}

export interface Recommendation {
  shipmentId: string;
  disruptionId: string | null;
  options: TransportOption[];
  recommendedOption?: TransportOption;
  disruption?: Disruption | null;
  generatedAt?: string;
}

export interface Explanation {
  text: string;
  explanation?: string;
  confidence?: string;
  tradeoffs?: string[];
}

export interface ServiceHealth {
  status: string;
  service: string;
  version: string;
  dataset_version?: string;
  dataset_status?: string;
  loaded_records?: Record<string, number>;
}
