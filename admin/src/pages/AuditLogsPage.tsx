import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { AuditLogEntry } from "../types";

export const AuditLogsPage: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: "LOG-9821",
      timestamp: "2026-10-18 10:14:22",
      corridor_id: "SHP-01 (Sakhir → Jeddah)",
      disruption_id: "None (Baseline)",
      recommended_mode: "Air",
      latency_ms: 28,
      status: "Optimized",
      emissions_kg: 1011500,
    },
    {
      id: "LOG-9820",
      timestamp: "2026-10-18 10:12:05",
      corridor_id: "SHP-05 (Miami → Imola)",
      disruption_id: "DIS-02 (Jetstream Strike)",
      recommended_mode: "Air (Charter High-Fly)",
      latency_ms: 36,
      status: "Rerouted",
      emissions_kg: 5387400,
    },
    {
      id: "LOG-9819",
      timestamp: "2026-10-18 10:08:44",
      corridor_id: "SHP-08 (Monaco → Montreal)",
      disruption_id: "DIS-01 (Red Sea Maritime Closure)",
      recommended_mode: "Air",
      latency_ms: 31,
      status: "Optimized",
      emissions_kg: 4426500,
    },
    {
      id: "LOG-9818",
      timestamp: "2026-10-18 10:02:18",
      corridor_id: "COM-01 (Shanghai → Rotterdam)",
      disruption_id: "DIS-01 (Red Sea Maritime Closure)",
      recommended_mode: "Rail (Eurasia Express)",
      latency_ms: 42,
      status: "Rerouted",
      emissions_kg: 378000,
    },
    {
      id: "LOG-9817",
      timestamp: "2026-10-18 09:55:01",
      corridor_id: "COM-03 (Singapore → Antwerp)",
      disruption_id: "DIS-03 (Dover Port Strike)",
      recommended_mode: "Sea (Rotterdam Detour)",
      latency_ms: 29,
      status: "Rerouted",
      emissions_kg: 216000,
    },
    {
      id: "LOG-9816",
      timestamp: "2026-10-18 09:41:30",
      corridor_id: "SHP-12 (Silverstone → Hungaroring)",
      disruption_id: "None (Baseline)",
      recommended_mode: "Road (European HGV Fleet)",
      latency_ms: 22,
      status: "Optimized",
      emissions_kg: 207360,
    },
  ]);

  const [filter, setFilter] = useState("ALL");

  const filteredLogs = logs.filter(
    (l) => filter === "ALL" || l.status === filter
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Decision Engine Audit Stream</h1>
          <p className="admin-page-sub">
            Traceable cryptographic record of routing decisions, multimodal tradeoffs, and ISO 14083 carbon accounting calls.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Evaluation Statuses</option>
            <option value="Optimized">Optimized Baseline</option>
            <option value="Rerouted">Disruption Rerouted</option>
          </select>
        </div>
      </div>

      <Card title={`Execution Records (${filteredLogs.length})`}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Corridor</th>
                <th>Disruption Scenario</th>
                <th>Recommended Mode</th>
                <th>Engine Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td><code>{log.id}</code></td>
                  <td>{log.timestamp}</td>
                  <td><strong>{log.corridor_id}</strong></td>
                  <td>{log.disruption_id}</td>
                  <td><span className="admin-mode-pill">{log.recommended_mode}</span></td>
                  <td>{log.latency_ms} ms</td>
                  <td>
                    <Badge variant={log.status === "Optimized" ? "good" : "warn"}>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
