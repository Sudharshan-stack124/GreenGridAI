import React from "react";
import type { Disruption } from "../types";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { ErrorState } from "./ui/ErrorState";
import { Badge, ModeBadge } from "./ui/Badge";
import { ZapIcon } from "./ui/Icons";

interface DisruptionPanelProps {
  disruptions: Disruption[] | null;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRetry?: () => void;
}

export const DisruptionPanel: React.FC<DisruptionPanelProps> = ({
  disruptions,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
}) => {
  return (
    <Card
      title="Disruption Scenario"
      subtitle="Simulate chokepoint delays & industrial action"
      icon={<ZapIcon size={16} />}
      right={
        <Badge variant={selectedId ? "white" : "titanium"}>
          {selectedId ? "Scenario Active" : "Baseline"}
        </Badge>
      }
    >
      {loading ? (
        <Spinner label="Loading disruption scenarios..." />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="gg-disruption-list" role="listbox" aria-label="Disruption scenarios">
          {/* Baseline Scenario */}
          <button
            type="button"
            className={`gg-disruption-item baseline-item ${selectedId === null ? "selected" : ""}`}
            onClick={() => onSelect(null)}
            role="option"
            aria-selected={selectedId === null}
          >
            <div className="gg-item-header">
              <strong className="gg-item-id">Baseline Benchmark</strong>
              <Badge variant={selectedId === null ? "white" : "subtle"}>Clear Corridors</Badge>
            </div>
            <p className="gg-disruption-desc">
              Standard operations without simulated geopolitical chokepoint delays, port strikes, or canal draft restrictions.
            </p>
          </button>

          {/* 5 Real Dataset Disruptions */}
          {disruptions?.map((d) => {
            const isSelected = d.disruption_id === selectedId;
            return (
              <button
                key={d.disruption_id}
                type="button"
                className={`gg-disruption-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(d.disruption_id)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="gg-item-header">
                  <div className="gg-item-id-group">
                    <strong className="gg-item-id">{d.disruption_id}</strong>
                    <ModeBadge mode={d.affected_mode} />
                  </div>
                  <Badge variant={isSelected ? "white" : "titanium"}>+{d.delay_impact_days}d Delay</Badge>
                </div>

                <h4 className="gg-disruption-title">{d.title}</h4>

                <div className="gg-disruption-impact-row">
                  <span className="gg-impact-metric">
                    Surcharge: <strong>+${d.cost_surcharge_usd.toLocaleString()}</strong>
                  </span>
                  <span className="gg-impact-metric">
                    CO₂e Delta: <strong>+{d.emissions_increase_pct}%</strong>
                  </span>
                </div>

                <p className="gg-disruption-desc" title={d.description}>
                  {d.description}
                </p>

                <div className="gg-disruption-mitigation">
                  <span className="gg-mitigation-label">Mitigation Corridor:</span>
                  <span className="gg-mitigation-val">{d.mitigation_mode}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};
