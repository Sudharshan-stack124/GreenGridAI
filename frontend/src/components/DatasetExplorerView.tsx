import React, { useState } from "react";
import { SHP_DATASET } from "../data/shipmentsData";
import { DIS_DATASET } from "../data/disruptionsData";
import { Card } from "./ui/Card";
import { Badge, ModeBadge } from "./ui/Badge";
import { PackageIcon, SearchIcon } from "./ui/Icons";
import { formatCost, formatDistance, formatWeight } from "./ui/formatters";

export const DatasetExplorerView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"shipments" | "disruptions">("shipments");
  const [filter, setFilter] = useState("");

  const filteredShipments = SHP_DATASET.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      s.shipment_id.toLowerCase().includes(q) ||
      s.origin_name.toLowerCase().includes(q) ||
      s.destination_name.toLowerCase().includes(q) ||
      s.cargo_description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="gg-dataset-explorer-view">
      <Card
        title="Frozen Benchmark Dataset Explorer (Version 2.1.1)"
        subtitle="Audited and validated ground truth telemetry for 27 freight corridors"
        icon={<PackageIcon size={16} />}
        right={
          <div className="gg-segmented-control">
            <button
              type="button"
              className={`gg-segment-btn ${activeSubTab === "shipments" ? "active" : ""}`}
              onClick={() => setActiveSubTab("shipments")}
            >
              Shipments (27)
            </button>
            <button
              type="button"
              className={`gg-segment-btn ${activeSubTab === "disruptions" ? "active" : ""}`}
              onClick={() => setActiveSubTab("disruptions")}
            >
              Disruptions (5)
            </button>
          </div>
        }
      >
        <div className="gg-dataset-meta-bar">
          <div className="gg-search-wrap" style={{ maxWidth: "380px" }}>
            <SearchIcon size={14} className="gg-search-icon" />
            <input
              type="search"
              className="gg-input gg-search-input"
              placeholder="Search dataset records..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="gg-dataset-metrics-summary">
            <span>Verified Records: <strong>{activeSubTab === "shipments" ? filteredShipments.length : DIS_DATASET.length}</strong></span>
            <span>Framework: <strong>ISO 14083 / DEFRA</strong></span>
          </div>
        </div>

        {activeSubTab === "shipments" ? (
          <div className="gg-table-container">
            <table className="gg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Use Case</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Distance</th>
                  <th>Weight</th>
                  <th>Delivery Window</th>
                  <th>Cargo Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s.shipment_id}>
                    <td><strong>{s.shipment_id}</strong></td>
                    <td>
                      <Badge variant="titanium">
                        {s.use_case_type === "F1_Demonstration" ? `F1 Round ${s.origin_round ?? s.leg_number}` : "Commercial"}
                      </Badge>
                    </td>
                    <td>{s.origin_name}, {s.origin_country}</td>
                    <td>{s.destination_name}, {s.destination_country}</td>
                    <td className="gg-tabular-num">{formatDistance(s.great_circle_km)}</td>
                    <td className="gg-tabular-num">{formatWeight(s.cargo_weight_tonnes)}</td>
                    <td className="gg-tabular-num">
                      <Badge variant="white">{s.available_window_days} Days</Badge>
                    </td>
                    <td className="gg-reason-text" title={s.cargo_description}>{s.cargo_description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gg-table-container">
            <table className="gg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Affected Mode</th>
                  <th>Delay Impact</th>
                  <th>Cost Surcharge</th>
                  <th>Emissions Delta</th>
                  <th>Geographic Corridor</th>
                  <th>Mitigation Mode</th>
                </tr>
              </thead>
              <tbody>
                {DIS_DATASET.map((d) => (
                  <tr key={d.disruption_id}>
                    <td><strong>{d.disruption_id}</strong></td>
                    <td><strong>{d.title}</strong></td>
                    <td><Badge variant="titanium">{d.type}</Badge></td>
                    <td><ModeBadge mode={d.affected_mode} /></td>
                    <td className="gg-tabular-num"><Badge variant="white">+{d.delay_impact_days} Days</Badge></td>
                    <td className="gg-tabular-num">{formatCost(d.cost_surcharge_usd)}</td>
                    <td className="gg-tabular-num">+{d.emissions_increase_pct}%</td>
                    <td>{d.geographic_corridor}</td>
                    <td><Badge variant="subtle">{d.mitigation_mode}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
