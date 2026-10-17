import React from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const AboutPage: React.FC = () => {
  return (
    <div className="about-root">
      <div className="about-hero">
        <Badge variant="frost" className="about-badge">Autonomous Freight Platform</Badge>
        <h1 className="about-title">About GreenGrid</h1>
        <p className="about-subtitle">
          Next-generation logistics decision-support platform optimizing freight route selections across transit velocity, operational cost, and CO₂e environmental impact.
        </p>
      </div>

      <div className="about-grid">
        <Card title="Project Mission" subtitle="Sustainable Multimodal Logistics">
          <p className="about-p">
            Global freight logistics accounts for over 8% of worldwide greenhouse gas emissions. When unexpected disruptions occur—such as the Red Sea maritime closure or the Dover Strait customs strike—supply chain operators are forced to make snap rerouting decisions that often spike carbon emissions by up to 300%.
          </p>
          <p className="about-p">
            <strong>GreenGrid</strong> provides real-time, multi-objective optimization that balances delivery deadlines (SLAs), financial budgets, and carbon expenditure according to the <strong>ISO 14083 / GLEC Framework</strong>.
          </p>
        </Card>

        <Card title="System Architecture" subtitle="High-Throughput Enterprise Resilience">
          <p className="about-p">
            Built for mission-critical enterprise resilience, GreenGrid leverages a high-throughput, low-latency microservices architecture:
          </p>
          <ul className="about-list">
            <li><strong>Data Service:</strong> Telemetry ingestion and catalog of 27 high-priority corridors and live disruption feeds.</li>
            <li><strong>Decision Engine:</strong> High-performance deterministic scoring evaluating 108 carrier routes simultaneously.</li>
            <li><strong>AI Explanation Service:</strong> Generative reasoning engine synthesizing natural language tradeoff justifications.</li>
            <li><strong>User Dashboard:</strong> Ultra-responsive, zero-latency decision interface with liquid glass aesthetics.</li>
          </ul>
        </Card>
      </div>

      <div className="about-architecture-card">
        <Card title="System Dataflow & Microservices">
          <div className="about-pipeline">
            <div className="about-node">
              <span className="about-node-tag">Ingestion</span>
              <h4>Data Service</h4>
              <p>Frozen Benchmark v2.1.1 (27 Shipments, 5 Disruptions)</p>
            </div>
            <div className="about-arrow">→</div>
            <div className="about-node">
              <span className="about-node-tag">Processing</span>
              <h4>Decision Engine</h4>
              <p>DEFRA Emission Factors, Circuity, Deadline Feasibility</p>
            </div>
            <div className="about-arrow">→</div>
            <div className="about-node">
              <span className="about-node-tag">Reasoning</span>
              <h4>Watsonx Granite AI</h4>
              <p>Tradeoff synthesis, SLA risk explanation</p>
            </div>
            <div className="about-arrow">→</div>
            <div className="about-node active">
              <span className="about-node-tag">Interface</span>
              <h4>User Dashboard</h4>
              <p>Monochrome Liquid Glass Frontend</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="about-grid" style={{ marginTop: "24px" }}>
        <Card title="Standards & Methodologies">
          <div className="about-specs">
            <div className="about-spec-row">
              <span className="about-spec-name">Carbon Calculation</span>
              <span className="about-spec-val">DEFRA 2024 / GLEC Framework v3.0</span>
            </div>
            <div className="about-spec-row">
              <span className="about-spec-name">Emissions Standard</span>
              <span className="about-spec-val">ISO 14083 (Quantification and reporting)</span>
            </div>
            <div className="about-spec-row">
              <span className="about-spec-name">Distance Modeling</span>
              <span className="about-spec-val">Great-Circle Haversine + Mode Circuity Multipliers</span>
            </div>
            <div className="about-spec-row">
              <span className="about-spec-name">Dataset Integrity</span>
              <span className="about-spec-val">Frozen Benchmark v2.1.1 (Audited CSV)</span>
            </div>
          </div>
        </Card>

        <Card title="Development Team">
          <div className="about-team-grid">
            <div className="about-member">
              <strong>Bharath Pemmasani</strong>
              <span>User Dashboard Frontend Lead</span>
            </div>
            <div className="about-member">
              <strong>Kruthin</strong>
              <span>Data Service & Dataset Engineering</span>
            </div>
            <div className="about-member">
              <strong>Revanth</strong>
              <span>Decision Engine & Optimization</span>
            </div>
            <div className="about-member">
              <strong>Punith</strong>
              <span>AI Service & Reasoning Engine</span>
            </div>
            <div className="about-member">
              <strong>JP</strong>
              <span>Admin UI & Telemetry Controls</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
