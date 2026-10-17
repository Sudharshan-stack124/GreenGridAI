import React from "react";
import type { TransportOption } from "../types";
import { Card } from "./ui/Card";
import { Badge, ModeBadge } from "./ui/Badge";
import { LayersIcon } from "./ui/Icons";
import { formatCost, formatEmissions, formatTransitTime } from "./ui/formatters";

interface RankedAlternativesTableProps {
  options: TransportOption[];
}

export const RankedAlternativesTable: React.FC<RankedAlternativesTableProps> = ({ options }) => {
  return (
    <Card
      title="Ranked Transport Alternatives"
      subtitle="Complete multimodal evaluation across candidate carrier networks"
      icon={<LayersIcon size={16} />}
      right={<Badge variant="titanium">{options.length} Modes Evaluated</Badge>}
    >
      <div className="gg-table-container">
        <table className="gg-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: "50px" }}>Rank</th>
              <th scope="col" style={{ width: "120px" }}>Mode</th>
              <th scope="col" style={{ width: "110px" }}>Status</th>
              <th scope="col">Total Cost</th>
              <th scope="col">Transit Time</th>
              <th scope="col">CO₂e Footprint</th>
              <th scope="col">Deadline Status</th>
              <th scope="col">Score</th>
              <th scope="col">Feasibility & Operational Note</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt, index) => {
              const isWinner = opt.is_recommended;
              const isFeasible = opt.feasibility_status === "Feasible";
              const deadlineMet = opt.meets_deadline;

              return (
                <tr key={opt.option_id || opt.mode} className={isWinner ? "gg-table-row-winner" : ""}>
                  <td>
                    <span className={`gg-rank-badge ${isWinner ? "winner" : ""}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <ModeBadge mode={opt.mode} />
                  </td>
                  <td>
                    <Badge variant={isFeasible ? (isWinner ? "white" : "titanium") : "subtle"}>
                      {opt.feasibility_status}
                    </Badge>
                  </td>
                  <td className="gg-tabular-num">
                    <strong>{formatCost(opt.total_cost_usd)}</strong>
                  </td>
                  <td className="gg-tabular-num">
                    {formatTransitTime(opt.transit_time_days)}
                  </td>
                  <td className="gg-tabular-num">
                    {formatEmissions(opt.total_emissions_tco2e)}
                  </td>
                  <td>
                    {!isFeasible ? (
                      <span className="gg-text-muted">—</span>
                    ) : deadlineMet === true ? (
                      <Badge variant="good">
                        Met {opt.deadline_margin_days != null ? `(+${opt.deadline_margin_days}d)` : ""}
                      </Badge>
                    ) : (
                      <Badge variant="bad">
                        Breached {opt.deadline_margin_days != null ? `(${opt.deadline_margin_days}d)` : ""}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {opt.composite_score != null ? (
                      <span className="gg-score-pill">{opt.composite_score.toFixed(1)}</span>
                    ) : (
                      <span className="gg-text-muted">—</span>
                    )}
                  </td>
                  <td className="gg-note-cell">
                    <div className="gg-reason-text">{opt.feasibility_reason}</div>
                    {opt.note && <div className="gg-extra-note">{opt.note}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
