import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { OPTIONS_DATASET } from "../data/transportOptionsData";
import type { TransportOption } from "../types";
import { formatCost, formatTransitTime, formatEmissions } from "../components/ui/formatters";

export const AnalyticsPage: React.FC = () => {
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("ALL");

  // Aggregate telemetry from the 108 transport options
  const modes = ["Air", "Road", "Rail", "Sea"];
  const modeStats = modes.map((mode) => {
    const options: TransportOption[] = OPTIONS_DATASET.filter(
      (o: TransportOption) => o.mode === mode && o.feasibility_status === "Feasible"
    );
    const count = options.length;
    const avgCost = count > 0 
      ? options.reduce((acc: number, cur: TransportOption) => acc + (cur.total_cost_usd || 0), 0) / count 
      : 0;
    const avgTransit = count > 0 
      ? options.reduce((acc: number, cur: TransportOption) => acc + (cur.transit_time_days || 0), 0) / count 
      : 0;
    const avgEmissions = count > 0 
      ? options.reduce((acc: number, cur: TransportOption) => acc + (cur.total_emissions_tco2e || 0), 0) / count 
      : 0;
    return { mode, count, avgCost, avgTransit, avgEmissions };
  });

  const filteredOptions: TransportOption[] = selectedModeFilter === "ALL" 
    ? OPTIONS_DATASET 
    : OPTIONS_DATASET.filter((o: TransportOption) => o.mode === selectedModeFilter);

  return (
    <div className="analytics-root">
      <div className="analytics-hero">
        <Badge variant="frost" className="analytics-badge">Fleet Telemetry & Benchmarks</Badge>
        <h1 className="analytics-title">Corridor Analytics</h1>
        <p className="analytics-subtitle">
          Cross-modal comparison across 108 carrier routes and 27 freight corridors evaluated under ISO 14083 / GLEC Framework v3.0.
        </p>
      </div>

      {/* Mode KPI Grid */}
      <div className="analytics-kpi-grid">
        {modeStats.map((stat) => (
          <div key={stat.mode} className="analytics-kpi-card">
            <div className="analytics-kpi-header">
              <span className="analytics-kpi-mode">{stat.mode} Freight</span>
              <Badge variant="titanium">{stat.count} Feasible Routes</Badge>
            </div>
            <div className="analytics-kpi-metrics">
              <div className="analytics-kpi-item">
                <span className="analytics-kpi-label">Avg. Transit Time</span>
                <span className="analytics-kpi-value">{formatTransitTime(stat.avgTransit)}</span>
              </div>
              <div className="analytics-kpi-item">
                <span className="analytics-kpi-label">Avg. Operating Cost</span>
                <span className="analytics-kpi-value">{formatCost(stat.avgCost)}</span>
              </div>
              <div className="analytics-kpi-item">
                <span className="analytics-kpi-label">Avg. Carbon Footprint</span>
                <span className="analytics-kpi-value">{formatEmissions(stat.avgEmissions)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DEFRA Benchmark Table */}
      <div className="analytics-section">
        <Card title="Modal Tradeoff Matrix" subtitle="Global averages compiled from the frozen benchmark dataset v2.1.1">
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Transport Mode</th>
                  <th>Speed Class</th>
                  <th>Carbon Intensity</th>
                  <th>Cost Factor</th>
                  <th>DEFRA Emission Standard</th>
                  <th>Typical Best Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Air Cargo</strong></td>
                  <td><span className="gg-badge good">Ultra Fast (1–3 Days)</span></td>
                  <td><span className="gg-badge bad">High (~0.602 kg CO₂e/t-km)</span></td>
                  <td><span className="gg-badge bad">Highest Premium</span></td>
                  <td>DEFRA 2024 Long-Haul Bellyhold/Freighter</td>
                  <td>Critical race equipment, sub-deadline emergencies</td>
                </tr>
                <tr>
                  <td><strong>Road Freight</strong></td>
                  <td><span className="gg-badge warn">Medium (2–6 Days)</span></td>
                  <td><span className="gg-badge warn">Moderate (~0.108 kg CO₂e/t-km)</span></td>
                  <td><span className="gg-badge subtle">Moderate</span></td>
                  <td>DEFRA 2024 Heavy Articulated HGVs (&gt;33t)</td>
                  <td>Intra-continental point-to-point transit (Europe)</td>
                </tr>
                <tr>
                  <td><strong>Rail Freight</strong></td>
                  <td><span className="gg-badge subtle">Standard (4–12 Days)</span></td>
                  <td><span className="gg-badge good">Low (~0.028 kg CO₂e/t-km)</span></td>
                  <td><span className="gg-badge good">Economical</span></td>
                  <td>DEFRA 2024 Electric &amp; Diesel Class-1 Rail</td>
                  <td>Trans-continental high-volume overland cargo</td>
                </tr>
                <tr>
                  <td><strong>Sea Maritime</strong></td>
                  <td><span className="gg-badge bad">Slow (12–35 Days)</span></td>
                  <td><span className="gg-badge good">Lowest (~0.016 kg CO₂e/t-km)</span></td>
                  <td><span className="gg-badge good">Lowest Cost</span></td>
                  <td>DEFRA 2024 Container Vessel (&gt;8000 TEU)</td>
                  <td>Non-urgent bulk freight with long lead times</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Corridor Breakdown */}
      <div className="analytics-section">
        <Card 
          title="All 108 Mode Options Telemetry" 
          subtitle={`Showing ${filteredOptions.length} routes from the Frozen Dataset v2.1.1`}
        >
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
            <div className="analytics-filter-pills">
              {["ALL", "Air", "Road", "Rail", "Sea"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`analytics-filter-btn ${selectedModeFilter === mode ? "active" : ""}`}
                  onClick={() => setSelectedModeFilter(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Option ID</th>
                  <th>Corridor</th>
                  <th>Carrier Mode</th>
                  <th>Distance</th>
                  <th>Transit Time</th>
                  <th>Est. Cost</th>
                  <th>CO₂e Emissions</th>
                  <th>Feasibility</th>
                </tr>
              </thead>
              <tbody>
                {filteredOptions.slice(0, 20).map((opt: TransportOption) => {
                  const isFeasible = opt.feasibility_status === "Feasible";
                  return (
                    <tr key={opt.option_id}>
                      <td><code>{opt.option_id}</code></td>
                      <td><strong>{opt.shipment_id}</strong></td>
                      <td><span className="analytics-mode-pill">{opt.mode}</span></td>
                      <td>{opt.route_distance_km ? `${opt.route_distance_km.toLocaleString()} km` : "—"}</td>
                      <td>{formatTransitTime(opt.transit_time_days)}</td>
                      <td>{formatCost(opt.total_cost_usd)}</td>
                      <td>{formatEmissions(opt.total_emissions_tco2e)}</td>
                      <td>
                        <Badge variant={isFeasible ? "good" : "bad"}>
                          {opt.feasibility_status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredOptions.length > 20 && (
              <div className="analytics-more-note">
                Showing top 20 of {filteredOptions.length} records. For full query capabilities, visit the <a href="/dataset">Dataset Explorer</a>.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
