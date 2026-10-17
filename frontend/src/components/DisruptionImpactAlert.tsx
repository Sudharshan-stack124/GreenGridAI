import React from "react";
import type { Disruption } from "../types";
import { ModeBadge } from "./ui/Badge";
import { ShieldAlertIcon } from "./ui/Icons";

interface DisruptionImpactAlertProps {
  disruption: Disruption;
  onClear: () => void;
}

export const DisruptionImpactAlert: React.FC<DisruptionImpactAlertProps> = ({
  disruption,
  onClear,
}) => {
  return (
    <div className="gg-disruption-alert-banner" role="alert">
      <div className="gg-alert-header">
        <div className="gg-alert-icon-title">
          <div className="gg-alert-icon-wrap">
            <ShieldAlertIcon size={18} />
          </div>
          <div>
            <h4 className="gg-alert-title">Active Disruption: {disruption.title}</h4>
            <div className="gg-alert-sub">
              Corridor: <strong>{disruption.geographic_corridor}</strong> • Status: {disruption.status}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="gg-clear-alert-btn"
          onClick={onClear}
          title="Reset to baseline analysis"
        >
          Reset to Baseline ×
        </button>
      </div>

      <div className="gg-alert-metrics-strip">
        <div className="gg-alert-chip">
          <span>Affected Mode:</span>
          <ModeBadge mode={disruption.affected_mode} />
        </div>
        <div className="gg-alert-chip">
          <span>Transit Delay:</span>
          <strong>+{disruption.delay_impact_days} Days</strong>
        </div>
        <div className="gg-alert-chip">
          <span>Cost Penalty:</span>
          <strong>+${disruption.cost_surcharge_usd.toLocaleString()} USD</strong>
        </div>
        <div className="gg-alert-chip">
          <span>Emissions Delta:</span>
          <strong>+{disruption.emissions_increase_pct}%</strong>
        </div>
      </div>

      <p className="gg-alert-body">{disruption.description}</p>

      <div className="gg-alert-mitigation">
        <span className="gg-mitigation-tag">Recommended Rerouting:</span>
        <span>{disruption.mitigation_mode}</span>
      </div>
    </div>
  );
};
