import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ServerIcon, ShipmentsIcon, DisruptionIcon, LeafIcon } from "../components/ui/Icons";

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Operations Overview</h1>
          <p className="admin-page-sub">
            Real-time status of the GreenGrid Autonomous Freight Decision Infrastructure.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => navigate("/disruptions")}
          >
            Manage Disruptions
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => navigate("/shipments")}
          >
            View Corridors
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Corridors</span>
            <span className="admin-kpi-icon-wrap"><ShipmentsIcon size={16} /></span>
          </div>
          <div className="admin-kpi-val">27</div>
          <div className="admin-kpi-meta">23 Calendar + 4 Commercial Corridors</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Disruptions</span>
            <span className="admin-kpi-icon-wrap"><DisruptionIcon size={16} /></span>
          </div>
          <div className="admin-kpi-val">5</div>
          <div className="admin-kpi-meta">1 Chokepoint, 2 Strikes, 2 Weather</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Carrier Routes</span>
            <span className="admin-kpi-icon-wrap"><ServerIcon size={16} /></span>
          </div>
          <div className="admin-kpi-val">108</div>
          <div className="admin-kpi-meta">Air, Road, Rail, Sea Evaluated</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">SLA Compliance</span>
            <span className="admin-kpi-icon-wrap"><LeafIcon size={16} /></span>
          </div>
          <div className="admin-kpi-val">96.3%</div>
          <div className="admin-kpi-meta">DEFRA 2024 / ISO 14083 Verified</div>
        </div>
      </div>

      {/* Microservice Health */}
      <div className="admin-section">
        <Card title="Microservice Architecture & Health" subtitle="Real-time telemetry from service layer">
          <div className="admin-services-grid">
            {[
              {
                name: "Data Service",
                desc: "Catalog ingestion of 27 corridors and frozen v2.1.1 ground truth",
                latency: "12ms",
                status: "Operational",
                port: "API Endpoint",
              },
              {
                name: "Decision Engine",
                desc: "Multi-objective routing (Cost, Speed, CO₂e, circuity multipliers)",
                latency: "34ms",
                status: "Operational",
                port: "In-Memory Optimization",
              },
              {
                name: "AI Service",
                desc: "Generative decision rationale explaining multimodal tradeoffs",
                latency: "420ms",
                status: "Operational",
                port: "Granite LLM Pipeline",
              },
              {
                name: "User Dashboard",
                desc: "User decision-support dashboard running at port 5173",
                latency: "2ms",
                status: "Serving",
                port: "http://localhost:5173",
              },
            ].map((svc) => (
              <div key={svc.name} className="admin-service-card">
                <div className="admin-svc-header">
                  <strong>{svc.name}</strong>
                  <Badge variant="good">{svc.status}</Badge>
                </div>
                <p className="admin-svc-desc">{svc.desc}</p>
                <div className="admin-svc-footer">
                  <span>Latency: <strong>{svc.latency}</strong></span>
                  <span>{svc.port}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Activity Stream */}
      <div className="admin-section">
        <Card title="Recent Dispatch & Evaluation Events" subtitle="Latest corridor evaluations from Decision Engine">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Corridor</th>
                  <th>Disruption Applied</th>
                  <th>Chosen Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10:14:22</td>
                  <td><strong>SHP-01 (Sakhir → Jeddah)</strong></td>
                  <td>Baseline (None)</td>
                  <td>Air Cargo</td>
                  <td><Badge variant="good">SLA Met (+1.4d)</Badge></td>
                </tr>
                <tr>
                  <td>10:12:05</td>
                  <td><strong>SHP-05 (Miami → Imola)</strong></td>
                  <td>DIS-02 (Jetstream Strike)</td>
                  <td>Rail / Air Hybrid</td>
                  <td><Badge variant="warn">Rerouted</Badge></td>
                </tr>
                <tr>
                  <td>10:08:44</td>
                  <td><strong>SHP-08 (Monaco → Montreal)</strong></td>
                  <td>DIS-01 (Red Sea Closure)</td>
                  <td>Air Freight</td>
                  <td><Badge variant="good">SLA Met (+2.1d)</Badge></td>
                </tr>
                <tr>
                  <td>10:02:18</td>
                  <td><strong>COM-01 (Shanghai → Rotterdam)</strong></td>
                  <td>DIS-01 (Red Sea Closure)</td>
                  <td>Eurasia Rail Express</td>
                  <td><Badge variant="good">Cost -32% vs Air</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
