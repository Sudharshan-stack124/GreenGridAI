import React from "react";
import type { Disruption, Shipment } from "../types";
import { PackageIcon, ZapIcon, CompassIcon, ShieldAlertIcon } from "./ui/Icons";

interface StatOverviewProps {
  totalShipments: number;
  totalDisruptions: number;
  selectedShipment: Shipment | null;
  selectedDisruption: Disruption | null;
}

export const StatOverview: React.FC<StatOverviewProps> = ({
  totalShipments,
  totalDisruptions,
  selectedShipment,
  selectedDisruption,
}) => {
  return (
    <div className="gg-stat-overview-grid">
      <div className="gg-stat-card">
        <div className="gg-stat-header">
          <PackageIcon size={14} className="gg-stat-icon-svg" />
          <span className="gg-stat-title">Monitored Freight</span>
        </div>
        <div className="gg-stat-value">{totalShipments || 27}</div>
        <div className="gg-stat-caption">23 Formula 1 Legs / 4 Commercial Corridors</div>
      </div>

      <div className="gg-stat-card">
        <div className="gg-stat-header">
          <ZapIcon size={14} className="gg-stat-icon-svg" />
          <span className="gg-stat-title">Disruption Scenarios</span>
        </div>
        <div className="gg-stat-value">{totalDisruptions || 5}</div>
        <div className="gg-stat-caption">Chokepoint, Strike, and Weather Scenarios</div>
      </div>

      <div className="gg-stat-card">
        <div className="gg-stat-header">
          <CompassIcon size={14} className="gg-stat-icon-svg" />
          <span className="gg-stat-title">Active Corridor</span>
        </div>
        <div className="gg-stat-value truncate" title={selectedShipment ? `${selectedShipment.origin_name} to ${selectedShipment.destination_name}` : "None"}>
          {selectedShipment
            ? `${selectedShipment.origin_name} → ${selectedShipment.destination_name}`
            : "Select a Shipment"}
        </div>
        <div className="gg-stat-caption">
          {selectedShipment
            ? `${selectedShipment.shipment_id} • ${selectedShipment.cargo_weight_tonnes}t • ${selectedShipment.available_window_days}d Window`
            : "Awaiting selection"}
        </div>
      </div>

      <div className="gg-stat-card">
        <div className="gg-stat-header">
          <ShieldAlertIcon size={14} className="gg-stat-icon-svg" />
          <span className="gg-stat-title">Operating Scenario</span>
        </div>
        <div className="gg-stat-value truncate" title={selectedDisruption?.title || "Baseline Benchmark"}>
          {selectedDisruption ? selectedDisruption.title : "Baseline"}
        </div>
        <div className="gg-stat-caption">
          {selectedDisruption
            ? `${selectedDisruption.affected_mode} Affected (+${selectedDisruption.delay_impact_days}d delay)`
            : "Normal operating conditions across all corridors"}
        </div>
      </div>
    </div>
  );
};
