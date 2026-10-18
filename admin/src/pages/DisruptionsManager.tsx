import React, { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { PlusIcon } from "../components/ui/Icons";
import { DIS_DATASET } from "../data/disruptionsData";
import type { AdminDisruption } from "../types";

export const DisruptionsManager: React.FC = () => {
  const [disruptions, setDisruptions] = useState<AdminDisruption[]>(() =>
    DIS_DATASET.map((d) => ({
      ...d,
      status: "Active",
    }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Disruption Form State
  const [newId, setNewId] = useState(`DIS-0${disruptions.length + 1}`);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Geopolitical / Chokepoint Closure");
  const [newMode, setNewMode] = useState<"Air" | "Road" | "Rail" | "Sea">("Sea");
  const [newCorridor, setNewCorridor] = useState("Transpacific Maritime Corridor");
  const [newDelay, setNewDelay] = useState(8.0);
  const [newCost, setNewCost] = useState(95000);
  const [newEmissions, setNewEmissions] = useState(25.0);
  const [newDesc, setNewDesc] = useState("");
  const [newMitigation, setNewMitigation] = useState("Eurasia Rail Express or Air Charter");

  const handleToggle = (id: string) => {
    setDisruptions((prev) =>
      prev.map((d) =>
        d.disruption_id === id
          ? {
              ...d,
              status: d.status === "Active" ? "Inactive" : "Active",
            }
          : d
      )
    );
  };

  const handleInjectDisruption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: AdminDisruption = {
      disruption_id: newId,
      title: newTitle,
      type: newType,
      affected_mode: newMode,
      geographic_corridor: newCorridor,
      delay_impact_days: Number(newDelay),
      cost_surcharge_usd: Number(newCost),
      emissions_increase_pct: Number(newEmissions),
      description: newDesc || `${newTitle} impacting ${newMode} transport.`,
      status: "Active",
      mitigation_mode: newMitigation,
      is_custom: true,
    };

    setDisruptions([created, ...disruptions]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewId(`DIS-0${disruptions.length + 2}`);
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Disruption Event Command Center</h1>
          <p className="admin-page-sub">
            Simulate and control supply-chain bottlenecks, geopolitical closures, and severe weather rerouting.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon size={16} />
            <span>Inject Custom Disruption</span>
          </button>
        </div>
      </div>

      <div className="admin-disruption-grid">
        {disruptions.map((d) => {
          const isActive = d.status === "Active";
          return (
            <div key={d.disruption_id} className={`admin-disruption-card ${isActive ? "active" : "inactive"}`}>
              <div className="admin-dis-top">
                <div className="admin-dis-id-row">
                  <code>{d.disruption_id}</code>
                  <Badge variant={isActive ? "warn" : "subtle"}>
                    {isActive ? "Active Stress-Test" : "Disabled"}
                  </Badge>
                </div>
                <button
                  type="button"
                  className={`admin-toggle-switch ${isActive ? "on" : "off"}`}
                  onClick={() => handleToggle(d.disruption_id)}
                  title={isActive ? "Click to deactivate" : "Click to activate"}
                >
                  <span className="admin-toggle-knob" />
                </button>
              </div>

              <h3 className="admin-dis-title">{d.title}</h3>
              <p className="admin-dis-desc">{d.description}</p>

              <div className="admin-dis-impact-row">
                <div className="admin-dis-metric">
                  <span className="admin-dis-metric-label">Mode Impacted</span>
                  <span className="admin-dis-metric-val">{d.affected_mode}</span>
                </div>
                <div className="admin-dis-metric">
                  <span className="admin-dis-metric-label">Delay Penalty</span>
                  <span className="admin-dis-metric-val">+{d.delay_impact_days}d</span>
                </div>
                <div className="admin-dis-metric">
                  <span className="admin-dis-metric-label">Cost Surcharge</span>
                  <span className="admin-dis-metric-val">+${d.cost_surcharge_usd?.toLocaleString()}</span>
                </div>
                <div className="admin-dis-metric">
                  <span className="admin-dis-metric-label">Carbon Surge</span>
                  <span className="admin-dis-metric-val">+{d.emissions_increase_pct}%</span>
                </div>
              </div>

              <div className="admin-dis-mitigation">
                <span>Reroute Strategy: </span>
                <strong>{d.mitigation_mode}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Inject Custom Supply-Chain Disruption"
      >
        <form onSubmit={handleInjectDisruption} className="admin-form">
          <div className="admin-form-group">
            <label>Disruption ID</label>
            <input
              type="text"
              required
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Scenario Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Panama Canal Extreme Drought & Draft Restrictions"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Affected Transport Mode</label>
              <select
                value={newMode}
                onChange={(e) => setNewMode(e.target.value as any)}
                className="admin-select"
              >
                <option value="Sea">Sea Maritime</option>
                <option value="Air">Air Cargo</option>
                <option value="Road">Road Freight</option>
                <option value="Rail">Rail Overland</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Disruption Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="admin-select"
              >
                <option value="Geopolitical / Chokepoint Closure">Geopolitical / Chokepoint Closure</option>
                <option value="Weather & Climate Event">Weather & Climate Event</option>
                <option value="Labor & Port Strike">Labor & Port Strike</option>
                <option value="Customs & Regulatory Delay">Customs & Regulatory Delay</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Transit Delay (Days)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={newDelay}
                onChange={(e) => setNewDelay(Number(e.target.value))}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label>Cost Surcharge (USD)</label>
              <input
                type="number"
                step="1000"
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label>Carbon Surge (% CO₂e)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={newEmissions}
                onChange={(e) => setNewEmissions(Number(e.target.value))}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Geographic Corridor</label>
            <input
              type="text"
              value={newCorridor}
              onChange={(e) => setNewCorridor(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Operational Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="admin-textarea"
              placeholder="Explain the disruption mechanics and detour impact..."
            />
          </div>

          <div className="admin-form-group">
            <label>Mitigation Strategy (Alternative Carrier Recommendation)</label>
            <input
              type="text"
              value={newMitigation}
              onChange={(e) => setNewMitigation(e.target.value)}
              className="admin-input"
              placeholder="e.g. Dedicated Air Charter or Inland Rail Reroute"
            />
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              Inject Disruption
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
