import React from "react";
import type { Disruption, TransportOption } from "../types";
import { Card } from "./ui/Card";
import { Badge, ModeBadge } from "./ui/Badge";
import { formatCost, formatEmissions, formatTransitTime } from "./ui/formatters";

interface RecommendationHeroProps {
  topOption?: TransportOption;
  disruption?: Disruption | null;
  availableWindowDays?: number;
}

export const RecommendationHero: React.FC<RecommendationHeroProps> = ({
  topOption,
  disruption,
  availableWindowDays,
}) => {
  if (!topOption) return null;

  const deadlineMet = topOption.meets_deadline === true;
  const margin = topOption.deadline_margin_days;
  const isFeasible = topOption.feasibility_status === "Feasible";

  return (
    <Card
      title="Recommended Transport Strategy"
      subtitle="Evaluated by GreenGrid Decision Engine based on deadline SLA, cost, and emissions footprint"
      icon="🏆"
      right={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {disruption ? (
            <Badge variant="warn">
              Active Scenario: {disruption.disruption_id}
            </Badge>
          ) : (
            <Badge variant="good">Baseline Analysis</Badge>
          )}
          <Badge variant={deadlineMet ? "good" : "bad"}>
            {deadlineMet
              ? `✓ Deadline Met (${margin != null && margin > 0 ? `+${margin}d margin` : "on time"})`
              : `✕ Deadline Breached (${margin != null ? `${margin}d` : "late"})`}
          </Badge>
        </div>
      }
      className="gg-hero-recommendation-card"
    >
      <div className="gg-hero-grid">
        {/* Recommended Mode Box */}
        <div className="gg-hero-mode-box">
          <span className="gg-hero-eyebrow">PRIMARY SELECTION</span>
          <div className="gg-hero-mode-title">
            <ModeBadge mode={topOption.mode} />
            <span className="gg-mode-name">{topOption.mode} Freight</span>
          </div>
          <div className="gg-hero-status-row">
            <Badge variant={isFeasible ? "good" : "bad"}>
              {topOption.feasibility_status}
            </Badge>
            {topOption.composite_score != null && (
              <span className="gg-composite-score">
                Score: <strong>{topOption.composite_score.toFixed(1)}</strong>/100
              </span>
            )}
          </div>
          <p className="gg-feasibility-reason">{topOption.feasibility_reason}</p>
        </div>

        {/* Core Metrics Grid */}
        <div className="gg-hero-metric-tile">
          <span className="gg-metric-label">Estimated Total Cost</span>
          <div className="gg-metric-value">{formatCost(topOption.total_cost_usd)}</div>
          <div className="gg-metric-breakdown">
            {topOption.fixed_cost_usd != null && topOption.distance_cost_usd != null ? (
              <>Fixed: ${topOption.fixed_cost_usd.toLocaleString()} • Distance: ${topOption.distance_cost_usd.toLocaleString()}</>
            ) : (
              topOption.cost_status || "Standard Tariff Rate"
            )}
          </div>
        </div>

        <div className="gg-hero-metric-tile">
          <span className="gg-metric-label">Estimated Transit Time</span>
          <div className="gg-metric-value">{formatTransitTime(topOption.transit_time_days)}</div>
          <div className="gg-metric-breakdown">
            {availableWindowDays != null ? (
              <>Allowed Window: <strong>{availableWindowDays} days</strong> ({topOption.estimated_arrival_date !== "N/A" ? `ETA ${topOption.estimated_arrival_date}` : "On-Time"})</>
            ) : (
              "Within required transit window"
            )}
          </div>
        </div>

        <div className="gg-hero-metric-tile eco-tile">
          <span className="gg-metric-label">CO₂e Carbon Footprint</span>
          <div className="gg-metric-value eco-value">{formatEmissions(topOption.total_emissions_tco2e)}</div>
          <div className="gg-metric-breakdown">
            {topOption.emission_factor_kg_per_tkm != null ? (
              <>Factor: {topOption.emission_factor_kg_per_tkm} kg/tonne-km (DEFRA)</>
            ) : (
              "Verified GHG Protocol Metric"
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
