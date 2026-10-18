import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { EmissionFactorConfig } from "../types";

export const EmissionFactorsManager: React.FC = () => {
  const [factors, setFactors] = useState<EmissionFactorConfig[]>([
    {
      mode: "Air",
      factor_kg_per_tkm: 0.602,
      standard: "DEFRA 2024 Long-Haul Bellyhold/Freighter",
      circuity_default: 1.08,
      base_cost_per_km: 1.85,
      last_updated: "2026-10-15",
    },
    {
      mode: "Road",
      factor_kg_per_tkm: 0.108,
      standard: "DEFRA 2024 Articulated HGV (>33t Laden)",
      circuity_default: 1.25,
      base_cost_per_km: 0.95,
      last_updated: "2026-10-15",
    },
    {
      mode: "Rail",
      factor_kg_per_tkm: 0.028,
      standard: "DEFRA 2024 Class-1 Freight Rail (Electric/Diesel Blend)",
      circuity_default: 1.30,
      base_cost_per_km: 0.45,
      last_updated: "2026-10-15",
    },
    {
      mode: "Sea",
      factor_kg_per_tkm: 0.016,
      standard: "DEFRA 2024 Container Vessel (>8000 TEU)",
      circuity_default: 1.45,
      base_cost_per_km: 0.18,
      last_updated: "2026-10-15",
    },
  ]);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleUpdate = (mode: string, field: keyof EmissionFactorConfig, value: number) => {
    setFactors((prev) =>
      prev.map((f) => (f.mode === mode ? { ...f, [field]: value } : f))
    );
  };

  const handleSaveAll = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Carbon Benchmarks &amp; DEFRA Factors</h1>
          <p className="admin-page-sub">
            Calibrate emission factors (kg CO₂e / tonne-km) and mode circuity multipliers under ISO 14083 / GLEC Framework v3.0.
          </p>
        </div>
        <div className="admin-page-header-actions">
          {savedNotice && <Badge variant="good">Benchmarks Updated</Badge>}
          <button type="button" className="admin-btn-primary" onClick={handleSaveAll}>
            Save Calibrations
          </button>
        </div>
      </div>

      <div className="admin-factors-grid">
        {factors.map((f) => (
          <Card
            key={f.mode}
            title={`${f.mode} Freight Standard`}
            subtitle={f.standard}
            className="admin-factor-card"
          >
            <div className="admin-factor-inputs">
              <div className="admin-form-group">
                <label>Emission Factor (kg CO₂e / tonne-km)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={f.factor_kg_per_tkm}
                  onChange={(e) =>
                    handleUpdate(f.mode, "factor_kg_per_tkm", Number(e.target.value))
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Circuity Multiplier</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    value={f.circuity_default}
                    onChange={(e) =>
                      handleUpdate(f.mode, "circuity_default", Number(e.target.value))
                    }
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Base Rate ($ / km)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={f.base_cost_per_km}
                    onChange={(e) =>
                      handleUpdate(f.mode, "base_cost_per_km", Number(e.target.value))
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            <div className="admin-factor-meta">
              <span>Standard: <strong>GLEC Framework v3.0</strong></span>
              <span>Updated: <strong>{f.last_updated}</strong></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
