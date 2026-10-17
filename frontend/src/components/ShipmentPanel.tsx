import React, { useMemo, useState } from "react";
import type { Shipment } from "../types";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { ErrorState } from "./ui/ErrorState";
import { Badge } from "./ui/Badge";
import { SearchIcon, PackageIcon } from "./ui/Icons";

interface ShipmentPanelProps {
  shipments: Shipment[] | null;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry?: () => void;
}

export const ShipmentPanel: React.FC<ShipmentPanelProps> = ({
  shipments,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
}) => {
  const [filterType, setFilterType] = useState<"ALL" | "F1" | "COMM">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!shipments) return [];
    return shipments.filter((s) => {
      if (filterType === "F1" && s.use_case_type !== "F1_Demonstration") return false;
      if (filterType === "COMM" && s.use_case_type !== "Commercial_General") return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.shipment_id.toLowerCase().includes(q) ||
        s.origin_name.toLowerCase().includes(q) ||
        s.destination_name.toLowerCase().includes(q) ||
        s.origin_country.toLowerCase().includes(q) ||
        s.destination_country.toLowerCase().includes(q) ||
        s.cargo_description.toLowerCase().includes(q)
      );
    });
  }, [shipments, filterType, search]);

  return (
    <Card
      title="Shipment Selection"
      subtitle="Select a verified freight movement"
      icon={<PackageIcon size={16} />}
      right={
        <Badge variant="titanium">
          {filtered.length} of {shipments?.length ?? 0}
        </Badge>
      }
    >
      <div className="gg-panel-controls">
        <div className="gg-search-wrap">
          <SearchIcon size={14} className="gg-search-icon" />
          <input
            type="search"
            className="gg-input gg-search-input"
            placeholder="Search by ID, city, or cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search shipments"
          />
          {search && (
            <button
              type="button"
              className="gg-clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="gg-segmented-control" role="radiogroup" aria-label="Filter shipments by category">
          <button
            type="button"
            className={`gg-segment-btn ${filterType === "ALL" ? "active" : ""}`}
            onClick={() => setFilterType("ALL")}
          >
            All (27)
          </button>
          <button
            type="button"
            className={`gg-segment-btn ${filterType === "F1" ? "active" : ""}`}
            onClick={() => setFilterType("F1")}
          >
            Formula 1 (23)
          </button>
          <button
            type="button"
            className={`gg-segment-btn ${filterType === "COMM" ? "active" : ""}`}
            onClick={() => setFilterType("COMM")}
          >
            Commercial (4)
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading shipments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <div className="gg-empty-state">
          <span>No shipments match "{search}".</span>
          <button type="button" className="gg-link-btn" onClick={() => { setSearch(""); setFilterType("ALL"); }}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="gg-shipment-list" role="listbox" aria-label="Shipments list">
          {filtered.map((s) => {
            const isSelected = s.shipment_id === selectedId;
            const isF1 = s.use_case_type === "F1_Demonstration";
            return (
              <button
                key={s.shipment_id}
                type="button"
                className={`gg-shipment-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(s.shipment_id)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="gg-item-header">
                  <div className="gg-item-id-group">
                    <strong className="gg-item-id">{s.shipment_id}</strong>
                    <Badge variant={isSelected ? "white" : "titanium"} className="gg-tag-badge">
                      {isF1 ? `Round ${s.origin_round ?? s.leg_number}` : "Commercial"}
                    </Badge>
                  </div>
                  <span className="gg-item-window">{s.available_window_days}d window</span>
                </div>

                <div className="gg-item-route">
                  <span className="gg-route-city">{s.origin_name}</span>
                  <span className="gg-route-arrow">→</span>
                  <span className="gg-route-city">{s.destination_name}</span>
                </div>

                <div className="gg-item-meta">
                  <span className="gg-item-cargo" title={s.cargo_description}>
                    {s.cargo_description}
                  </span>
                  <span className="gg-item-weight">{s.cargo_weight_tonnes}t</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};
