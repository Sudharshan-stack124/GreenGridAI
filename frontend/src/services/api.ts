// GreenGrid API Integration Service
// Connects to Data Service, Decision Engine, and AI Explanation Service.
// Fully configurable via environment variables (.env / config.ts).

import { config } from "../config";
import type { Disruption, Explanation, Recommendation, ServiceHealth, Shipment, TransportOption } from "../types";
import { mockService } from "./mock";

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(baseUrl: string, serviceName: string, path: string, options: RequestOptions = {}): Promise<T> {
  if (!baseUrl) {
    throw new Error(`${serviceName} URL is not configured. Please define it in your .env file.`);
  }

  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const { timeoutMs = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let detail = "";
      try {
        const errJson = await response.json();
        detail = errJson.detail || errJson.message || "";
      } catch {
        detail = response.statusText;
      }
      throw new Error(`${serviceName} error (${response.status}): ${detail || response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === "AbortError") {
      throw new Error(`Connection to ${serviceName} timed out after ${timeoutMs}ms (${url})`);
    }
    throw err;
  }
}

// Normalizer to harmonize snake_case (Data Service / FastAPI) and camelCase (frontend)
function normalizeShipment(s: any): Shipment {
  const id = s.shipment_id || s.id || "";
  const weight = s.cargo_weight_tonnes != null ? Number(s.cargo_weight_tonnes) : (s.weightKg != null ? Number(s.weightKg) / 1000 : 0);
  return {
    ...s,
    shipment_id: id,
    id,
    origin_name: s.origin_name || s.origin || "Origin",
    destination_name: s.destination_name || s.destination || "Destination",
    cargo_description: s.cargo_description || s.cargoType || "Freight Cargo",
    cargo_weight_tonnes: weight,
    weightKg: Math.round(weight * 1000),
    delivery_deadline: s.delivery_deadline || s.deadline || "TBD",
    available_window_days: s.available_window_days != null ? Number(s.available_window_days) : 0,
    use_case_type: s.use_case_type || "Commercial_General",
  };
}

function normalizeDisruption(d: any): Disruption {
  const id = d.disruption_id || d.id || "";
  return {
    ...d,
    disruption_id: id,
    id,
    title: d.title || d.name || "Active Disruption",
    name: d.title || d.name || "Active Disruption",
    affected_mode: d.affected_mode || "Sea",
    delay_impact_days: Number(d.delay_impact_days ?? 0),
    cost_surcharge_usd: Number(d.cost_surcharge_usd ?? 0),
    emissions_increase_pct: Number(d.emissions_increase_pct ?? 0),
    description: d.description || "",
    mitigation_mode: d.mitigation_mode || "Air Charter",
    status: d.status || "Active",
  };
}

function normalizeOption(o: any): TransportOption {
  const transitDays = o.transit_time_days != null ? Number(o.transit_time_days) : (o.transitHours != null ? Number(o.transitHours) / 24 : null);
  const cost = o.total_cost_usd != null ? Number(o.total_cost_usd) : (o.cost != null ? Number(o.cost) : null);
  const emissions = o.total_emissions_tco2e != null ? Number(o.total_emissions_tco2e) : (o.co2eKg != null ? Number(o.co2eKg) / 1000 : null);

  return {
    ...o,
    transit_time_days: transitDays,
    transitHours: transitDays != null ? Math.round(transitDays * 24 * 10) / 10 : null,
    total_cost_usd: cost,
    cost,
    currency: o.currency || "USD",
    total_emissions_tco2e: emissions,
    co2eKg: emissions != null ? Math.round(emissions * 1000) : null,
    meets_deadline: o.meets_deadline === true || o.meets_deadline === "true",
    feasibility_status: o.feasibility_status || "Feasible",
    composite_score: o.composite_score != null ? Number(o.composite_score) : null,
  };
}

export const api = {
  getShipments: async (): Promise<Shipment[]> => {
    if (config.useMocks) {
      return mockService.getShipments();
    }
    const raw = await request<any[]>(config.dataUrl, "Data Service", "/shipments");
    return raw.map(normalizeShipment);
  },

  getDisruptions: async (): Promise<Disruption[]> => {
    if (config.useMocks) {
      return mockService.getDisruptions();
    }
    const raw = await request<any[]>(config.dataUrl, "Data Service", "/disruptions");
    return raw.map(normalizeDisruption);
  },

  getShipmentById: async (id: string): Promise<Shipment | null> => {
    if (config.useMocks) {
      return mockService.getShipmentById(id);
    }
    const raw = await request<any>(config.dataUrl, "Data Service", `/shipments/${encodeURIComponent(id)}`);
    return raw ? normalizeShipment(raw) : null;
  },

  getShipmentOptions: async (shipmentId: string): Promise<TransportOption[]> => {
    if (config.useMocks) {
      return mockService.getShipmentOptions(shipmentId);
    }
    const raw = await request<any[]>(config.dataUrl, "Data Service", `/shipments/${encodeURIComponent(shipmentId)}/options`);
    return raw.map(normalizeOption);
  },

  recommend: async (shipmentId: string, disruptionId: string | null): Promise<Recommendation> => {
    if (config.useMocks) {
      return mockService.recommend(shipmentId, disruptionId);
    }

    const payload = {
      shipment_id: shipmentId,
      disruption_id: disruptionId,
      // camelCase aliases for backward compatibility
      shipmentId,
      disruptionId,
    };

    const res = await request<any>(config.decisionUrl, "Decision Engine", "/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const options: TransportOption[] = (res.options || res.ranked_options || []).map(normalizeOption);
    const top = options.find((o) => o.is_recommended) || options[0];

    return {
      shipmentId,
      disruptionId,
      options,
      recommendedOption: top,
      disruption: res.disruption ? normalizeDisruption(res.disruption) : null,
      generatedAt: res.timestamp || new Date().toISOString(),
    };
  },

  explain: async (rec: Recommendation): Promise<Explanation> => {
    if (config.useMocks) {
      return mockService.explain(rec);
    }

    const payload = {
      shipment_id: rec.shipmentId,
      disruption_id: rec.disruptionId,
      recommended_mode: rec.recommendedOption?.mode,
      options: rec.options,
    };

    const res = await request<any>(config.aiUrl, "AI Service", "/explain", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      text: res.explanation || res.text || "AI decision explanation received.",
      explanation: res.explanation || res.text,
      confidence: res.confidence || "High",
      tradeoffs: res.tradeoffs || res.key_tradeoffs || [],
    };
  },

  checkHealth: async (): Promise<ServiceHealth> => {
    if (config.useMocks) {
      return mockService.getHealth();
    }
    return request<ServiceHealth>(config.dataUrl, "Data Service", "/health");
  },
};
