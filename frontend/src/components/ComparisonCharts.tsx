import React from "react";
import type { TransportOption } from "../types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { BarChartIcon } from "./ui/Icons";
import { formatCost, formatEmissions, formatTransitTime, isValidMetric } from "./ui/formatters";

interface ComparisonChartsProps {
  options: TransportOption[];
  availableWindowDays?: number;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  options,
  availableWindowDays,
}) => {
  const feasibleOptions = options.filter((o) => o.feasibility_status === "Feasible");

  const maxCost = Math.max(...feasibleOptions.map((o) => o.total_cost_usd ?? 0), 1);
  const maxTransit = Math.max(
    ...feasibleOptions.map((o) => o.transit_time_days ?? 0),
    availableWindowDays ?? 1,
    1
  );
  const maxEmissions = Math.max(...feasibleOptions.map((o) => o.total_emissions_tco2e ?? 0), 1);

  const compliantOptions = feasibleOptions.filter((o) => o.meets_deadline === true);
  const greenestCompliant = compliantOptions.reduce<TransportOption | null>((best, curr) => {
    if (!best) return curr;
    return (curr.total_emissions_tco2e ?? Infinity) < (best.total_emissions_tco2e ?? Infinity) ? curr : best;
  }, null);

  return (
    <Card
      title="Multimodal Tradeoff Analytics"
      subtitle="Visual cross-comparison of expenditure, velocity, and carbon footprint"
      icon={<BarChartIcon size={16} />}
      right={
        greenestCompliant && (
          <Badge variant="white">
            Lowest Carbon: {greenestCompliant.mode} ({formatEmissions(greenestCompliant.total_emissions_tco2e)})
          </Badge>
        )
      }
    >
      <div className="gg-charts-grid">
        {/* Cost Comparison */}
        <div className="gg-chart-card">
          <div className="gg-chart-header">
            <h4>Total Expenditure (USD)</h4>
            <span className="gg-chart-unit">Cost Benchmark</span>
          </div>
          <div className="gg-bar-list">
            {options.map((opt) => {
              const isFeasible = opt.feasibility_status === "Feasible";
              const val = opt.total_cost_usd;
              const pct = isValidMetric(val) && maxCost > 0 ? (val / maxCost) * 100 : 0;
              const isWinner = opt.is_recommended;

              return (
                <div key={`cost-${opt.mode}`} className={`gg-bar-row ${isWinner ? "winner" : ""}`}>
                  <div className="gg-bar-label-group">
                    <span className="gg-bar-mode">{opt.mode}</span>
                    <span className="gg-bar-value">{formatCost(val)}</span>
                  </div>
                  <div className="gg-bar-track">
                    {isFeasible && isValidMetric(val) ? (
                      <div
                        className={`gg-bar-fill ${isWinner ? "fill-white" : "fill-titanium"}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    ) : (
                      <div className="gg-bar-fill-infeasible">Infeasible Route</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transit Time Comparison */}
        <div className="gg-chart-card">
          <div className="gg-chart-header">
            <h4>Transit Time (Days)</h4>
            <span className="gg-chart-unit">
              {availableWindowDays ? `Limit: ${availableWindowDays}d Window` : "Velocity Comparison"}
            </span>
          </div>
          <div className="gg-bar-list">
            {options.map((opt) => {
              const isFeasible = opt.feasibility_status === "Feasible";
              const val = opt.transit_time_days;
              const pct = isValidMetric(val) && maxTransit > 0 ? (val / maxTransit) * 100 : 0;
              const deadlineMet = opt.meets_deadline === true;
              const isWinner = opt.is_recommended;

              return (
                <div key={`time-${opt.mode}`} className={`gg-bar-row ${isWinner ? "winner" : ""}`}>
                  <div className="gg-bar-label-group">
                    <span className="gg-bar-mode">{opt.mode}</span>
                    <span className="gg-bar-value">{formatTransitTime(val)}</span>
                  </div>
                  <div className="gg-bar-track">
                    {isFeasible && isValidMetric(val) ? (
                      <div
                        className={`gg-bar-fill ${deadlineMet ? (isWinner ? "fill-white" : "fill-titanium") : "fill-bad"}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    ) : (
                      <div className="gg-bar-fill-infeasible">Infeasible Route</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {availableWindowDays != null && (
            <div className="gg-deadline-legend">
              <span className="gg-legend-line" />
              <span>Modes exceeding the {availableWindowDays}-day delivery window violate SLA.</span>
            </div>
          )}
        </div>

        {/* CO2e Comparison */}
        <div className="gg-chart-card">
          <div className="gg-chart-header">
            <h4>Carbon Footprint (tCO₂e)</h4>
            <span className="gg-chart-unit">GHG Protocol Metric</span>
          </div>
          <div className="gg-bar-list">
            {options.map((opt) => {
              const isFeasible = opt.feasibility_status === "Feasible";
              const val = opt.total_emissions_tco2e;
              const pct = isValidMetric(val) && maxEmissions > 0 ? (val / maxEmissions) * 100 : 0;
              const isWinner = opt.is_recommended;
              const isGreenest = greenestCompliant?.mode === opt.mode;

              return (
                <div key={`co2-${opt.mode}`} className={`gg-bar-row ${isWinner ? "winner" : ""}`}>
                  <div className="gg-bar-label-group">
                    <span className="gg-bar-mode">
                      {opt.mode} {isGreenest && "(Lowest)"}
                    </span>
                    <span className="gg-bar-value">{formatEmissions(val)}</span>
                  </div>
                  <div className="gg-bar-track">
                    {isFeasible && isValidMetric(val) ? (
                      <div
                        className={`gg-bar-fill ${isWinner ? "fill-white" : "fill-titanium"}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    ) : (
                      <div className="gg-bar-fill-infeasible">Infeasible Route</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
