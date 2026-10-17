import React from "react";
import type { Shipment } from "../types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { CompassIcon } from "./ui/Icons";
import { formatDistance, formatWeight } from "./ui/formatters";

interface ShipmentDetailsProps {
  shipment?: Shipment | null;
}

export const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({ shipment }) => {
  if (!shipment) {
    return (
      <Card title="Corridor Specification" subtitle="Telemetry & contractual delivery constraints" icon={<CompassIcon size={16} />}>
        <div className="gg-empty-state">
          <p>Select a shipment from the left panel to inspect facility coordinates, cargo payload, and delivery deadline window.</p>
        </div>
      </Card>
    );
  }

  const isF1 = shipment.use_case_type === "F1_Demonstration";

  return (
    <Card
      title={`${shipment.shipment_id}: ${shipment.origin_name} to ${shipment.destination_name}`}
      subtitle={`${isF1 ? "Formula 1 World Championship Calendar" : "Commercial Global Supply Chain"} • Allowed Window: ${shipment.available_window_days} Days`}
      icon={<CompassIcon size={16} />}
      right={
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge variant="titanium">
            {isF1 ? `Round ${shipment.origin_round ?? shipment.leg_number} → Round ${shipment.destination_round ?? ((shipment.leg_number ?? 0) + 1)}` : "Commercial Corridor"}
          </Badge>
          <Badge variant="white">
            {shipment.available_window_days} Days Window
          </Badge>
        </div>
      }
    >
      <div className="gg-shipment-details-grid">
        {/* Origin Spec */}
        <div className="gg-spec-block">
          <div className="gg-spec-label">Origin Facility</div>
          <div className="gg-spec-val-primary">{shipment.origin_facility}</div>
          <div className="gg-spec-val-secondary">{shipment.origin_circuit}</div>
          <div className="gg-spec-coords">
            {shipment.origin_name}, {shipment.origin_country} ({shipment.origin_region})
            {shipment.origin_lat != null && shipment.origin_lon != null && (
              <span className="gg-coords-tag">[{shipment.origin_lat.toFixed(3)}°, {shipment.origin_lon.toFixed(3)}°]</span>
            )}
          </div>
        </div>

        {/* Destination Spec */}
        <div className="gg-spec-block">
          <div className="gg-spec-label">Destination Facility</div>
          <div className="gg-spec-val-primary">{shipment.destination_facility}</div>
          <div className="gg-spec-val-secondary">{shipment.destination_circuit}</div>
          <div className="gg-spec-coords">
            {shipment.destination_name}, {shipment.destination_country} ({shipment.destination_region})
            {shipment.destination_lat != null && shipment.destination_lon != null && (
              <span className="gg-coords-tag">[{shipment.destination_lat.toFixed(3)}°, {shipment.destination_lon.toFixed(3)}°]</span>
            )}
          </div>
        </div>

        {/* Cargo Specification */}
        <div className="gg-spec-block">
          <div className="gg-spec-label">Cargo Specification</div>
          <div className="gg-spec-val-primary">{shipment.cargo_description}</div>
          <div className="gg-spec-val-secondary">{formatWeight(shipment.cargo_weight_tonnes)}</div>
          <div className="gg-spec-caption">{shipment.weight_provenance}</div>
        </div>

        {/* Timing & Timeline */}
        <div className="gg-spec-block">
          <div className="gg-spec-label">Corridor Schedule & Distance</div>
          <div className="gg-spec-val-primary">Departure: {shipment.departure_date}</div>
          <div className="gg-spec-val-secondary">Delivery Deadline: {shipment.delivery_deadline}</div>
          <div className="gg-spec-caption">
            Great Circle Distance: {formatDistance(shipment.great_circle_km)} • Window: {shipment.available_window_days} Days
          </div>
        </div>
      </div>

      {shipment.notes && (
        <div className="gg-shipment-note">
          <span className="gg-note-label">Directive:</span> {shipment.notes}
        </div>
      )}
    </Card>
  );
};
