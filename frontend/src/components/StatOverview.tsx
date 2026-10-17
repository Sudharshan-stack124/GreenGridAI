import React from "react";
import type { Disruption, Shipment } from "../types";

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
          <span className="gg-stat-icon">📦</span>
          <span className="gg-stat-title">Monitored Freight</span>
        </div>
        <div className="gg-stat-value">{totalShipments || "27"}</div>
        <div className="gg-stat-caption">23 F1 Race Legs • 4 Commercial Corridors</div>
      </div>

      <div className="gg-stat-card">
        <div className="gg-stat-header">
          <span className="gg-stat-icon">⚡</span>
          <span className="gg-stat-title">Disruption Scenarios</span>
        </div>
        <div className="gg-stat-value">{totalDisruptions || "5"}</div>
        <div className="gg-stat-caption">Chokepoint, Weather, Port Strike Scenarios</div>
      </div>

      <div className="gg-stat-card highlight-card">
        <div className="gg-stat-header">
          <span className="gg-stat-icon">📍</span>
          <span className="gg-stat-title">Selected Corridor</span>
        </div>
        <div className="gg-stat-value truncate" title={selectedShipment ? `${selectedShipment.origin_name} → ${selectedShipment.destination_name}` : "None"}>
          {selectedShipment
            ? `${selectedShipment.origin_name} → ${selectedShipment.destination_name}`
            : "Select a Shipment"}
        </div>
        <div className="gg-stat-caption">
          {selectedShipment
            ? `${selectedShipment.shipment_id} • ${selectedShipment.cargo_weight_tonnes}t • ${selectedShipment.available_window_days}d window`
            : "Awaiting selection from left panel"}
        </div>
      </div>

      <div className={`gg-stat-card ${selectedDisruption ? "warning-border" : ""}`}>
        <div className="gg-stat-header">
          <span className="gg-stat-icon">{selectedDisruption ? "🚨" : "🛡"}</span>
          <span className="gg-stat-title">Operating Scenario</span>
        </div>
        <div className="gg-stat-value truncate" title={selectedDisruption?.title || "Baseline Benchmark"}>
          {selectedDisruption ? selectedDisruption.title : "Baseline (No Disruption)"}
        </div>
        <div className="gg-stat-caption">
          {selectedDisruption
            ? `Affects ${selectedDisruption.affected_mode} (+${selectedDisruption.delay_impact_days}d delay)`
            : "Clear navigation corridors across all modes"}
        </div>
      </div>
    </div>
  );
};
