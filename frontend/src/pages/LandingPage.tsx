import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SHP_DATASET } from "../data/shipmentsData";
import { DIS_DATASET } from "../data/disruptionsData";
import type { Shipment, Disruption } from "../types";

const COUNTER_TARGETS = [
  { label: "Monitored Shipments", value: 27 },
  { label: "Transport Modes", value: 4 },
  { label: "Disruption Scenarios", value: 5 },
  { label: "Transport Options", value: 108 },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const count = useCountUp(value, 1600, started);
  return (
    <div className="landing-stat">
      <span className="landing-stat-number">{count}</span>
      <span className="landing-stat-label">{label}</span>
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="landing-root">
      {/* Hero */}
      <section className={`landing-hero ${visible ? "visible" : ""}`} ref={heroRef}>
        <div className="landing-hero-bg" aria-hidden="true">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <span className="landing-eyebrow-pill">IBM Z Datathon 2026</span>
            <span className="landing-eyebrow-sep" />
            <span className="landing-eyebrow-text">Logistics Decision Support</span>
          </div>

          <div className="landing-logo-wrap">
            <img
              src="/greengrid-logo.jpg"
              alt="GreenGrid"
              className="landing-logo-img"
            />
          </div>

          <h1 className="landing-hero-headline">
            Intelligent Freight
            <br />
            <span className="landing-headline-accent">Rerouting Engine</span>
          </h1>

          <p className="landing-hero-sub">
            Compare Air, Road, Rail, and Sea alternatives by cost, transit time, CO₂e emissions, and SLA compliance — powered by IBM Z LinuxONE and Watsonx Granite AI.
          </p>

          <div className="landing-hero-ctas">
            <button
              type="button"
              className="landing-cta-primary"
              onClick={() => navigate("/dashboard")}
            >
              Open Dashboard
            </button>
            <button
              type="button"
              className="landing-cta-secondary"
              onClick={() => navigate("/scenarios")}
            >
              View Scenarios
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="landing-stats">
        {COUNTER_TARGETS.map((s, i) => (
          <StatCounter key={s.label} value={s.value} label={s.label} delay={i * 200 + 600} />
        ))}
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-header">
          <h2 className="landing-section-title">Built for Logistics Teams</h2>
          <p className="landing-section-sub">Every metric that matters, in a single decision surface.</p>
        </div>
        <div className="landing-feature-grid">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              ),
              title: "SLA Compliance",
              desc: "Real-time evaluation against delivery deadlines across all 27 monitored freight corridors.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              ),
              title: "Multimodal Routing",
              desc: "Air, Road, Rail, and Sea options scored by composite cost-velocity-carbon index.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: "Disruption Rerouting",
              desc: "Inject Red Sea closures, port strikes, or weather events and instantly see rerouted alternatives.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              ),
              title: "Watsonx AI Rationale",
              desc: "Granite LLM generates plain-language decision explanations for every recommendation.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: "ISO 14083 Carbon",
              desc: "Emissions calculated using DEFRA emission factors and GLEC Framework methodology.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              ),
              title: "Frozen Benchmark",
              desc: "Verified v2.1.1 dataset with 108 transport options locked for reproducible evaluation.",
            },
          ].map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Shipments Preview */}
      <section className="landing-preview">
        <div className="landing-features-header">
          <h2 className="landing-section-title">Live Shipment Corridors</h2>
          <p className="landing-section-sub">{SHP_DATASET.length} active routes across F1 calendar and commercial lanes.</p>
        </div>
        <div className="landing-shipment-preview-grid">
          {SHP_DATASET.slice(0, 6).map((s: Shipment) => (
            <div
              key={s.shipment_id}
              className="landing-shipment-chip"
              onClick={() => navigate("/dashboard")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/dashboard")}
            >
              <span className="landing-chip-id">{s.shipment_id}</span>
              <span className="landing-chip-route">{s.origin_name} → {s.destination_name}</span>
              <span className="landing-chip-type">{s.cargo_description || s.use_case_type}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="landing-cta-ghost"
          onClick={() => navigate("/dataset")}
        >
          Explore All {SHP_DATASET.length} Shipments
        </button>
      </section>

      {/* Disruption Preview */}
      <section className="landing-disruptions">
        <div className="landing-features-header">
          <h2 className="landing-section-title">Active Disruption Scenarios</h2>
          <p className="landing-section-sub">Stress-test freight rerouting against real-world disruptions.</p>
        </div>
        <div className="landing-disruption-row">
          {DIS_DATASET.map((d: Disruption) => (
            <div key={d.disruption_id} className="landing-disruption-chip">
              <span className="landing-d-id">{d.disruption_id}</span>
              <span className="landing-d-name">{d.title}</span>
              <span className="landing-d-type">{d.affected_mode}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <h2 className="landing-cta-title">Ready to analyse your freight corridor?</h2>
        <p className="landing-cta-desc">Select any shipment, inject a disruption, and get ranked multimodal recommendations in seconds.</p>
        <button
          type="button"
          className="landing-cta-primary large"
          onClick={() => navigate("/dashboard")}
        >
          Launch Decision Dashboard
        </button>
      </section>
    </div>
  );
};
