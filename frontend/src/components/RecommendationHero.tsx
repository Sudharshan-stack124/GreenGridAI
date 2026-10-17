import React from "react";
import type { Disruption, TransportOption } from "../types";
import { Card } from "./ui/Card";
import { Badge, ModeBadge } from "./ui/Badge";
import { CheckIcon } from "./ui/Icons";
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
      title="Optimal Transport Strategy"
      subtitle="Evaluated by Decision Engine against SLA deadline, financial expenditure, and carbon footprint"
      icon={<CheckIcon size={16} />}
      right={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {disruption ? (
            <Badge variant="warn">
              Scenario: {disruption.disruption_id}
            </Badge>
          ) : (
            <Badge variant="subtle">Baseline Analysis</Badge>
          )}
          <Badge variant={deadlineMet ? "white" : "bad"}>
            {deadlineMet
              ? `Deadline Met (${margin != null && margin > 0 ? `+${margin}d buffer` : "on-time"})`
              : `Deadline Breached (${margin != null ? `${margin}d` : "late"})`}
          </Badge>
        </div>
      }
      className="gg-hero-recommendation-card"
    >
      <div className="gg-hero-grid">
        {/* Recommended Mode Box */}
        <div className="gg-hero-mode-box">
          <span className="gg-hero-eyebrow">Primary Recommendation</span>
          <div className="gg-hero-mode-title">
            <ModeBadge mode={topOption.mode} />
            <span className="gg-mode-name">{topOption.mode} Freight</span>
          </div>
          <div className="gg-hero-status-row">
            <Badge variant={isFeasible ? "white" : "bad"}>
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
          <span className="gg-metric-label">Estimated Expenditure</span>
          <div className="gg-metric-value">{formatCost(topOption.total_cost_usd)}</div>
          <div className="gg-metric-breakdown">
            {topOption.fixed_cost_usd != null && topOption.distance_cost_usd != null ? (
              <>Fixed: ${topOption.fixed_cost_usd.toLocaleString()} • Variable: ${topOption.distance_cost_usd.toLocaleString()}</>
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
              <>Window: <strong>{availableWindowDays} days</strong> ({topOption.estimated_arrival_date !== "N/A" ? `ETA ${topOption.estimated_arrival_date}` : "On-Time"})</>
            ) : (
              "Within allowed corridor window"
            )}
          </div>
        </div>

        <div className="gg-hero-metric-tile">
          <span className="gg-metric-label">Carbon Footprint</span>
          <div className="gg-metric-value">{formatEmissions(topOption.total_emissions_tco2e)}</div>
          <div className="gg-metric-breakdown">
            {topOption.emission_factor_kg_per_tkm != null ? (
              <>{topOption.emission_factor_kg_per_tkm} kg/t-km (DEFRA)</>
            ) : (
              "GLEC / ISO 14083 Framework"
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
