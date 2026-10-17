import React from "react";
import { Badge } from "./ui/Badge";

interface HeaderProps {
  useMocks: boolean;
  onToggleMocks: (useMocks: boolean) => void;
  activeTab: "dashboard" | "scenarios" | "dataset";
  onSelectTab: (tab: "dashboard" | "scenarios" | "dataset") => void;
}

export const Header: React.FC<HeaderProps> = ({
  useMocks,
  onToggleMocks,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="gg-header">
      <div className="gg-header-container">
        <div className="gg-brand-section">
          <div className="gg-brand-logo">
            <span className="gg-logo-inner" />
          </div>
          <div className="gg-brand-titles">
            <div className="gg-brand-name-row">
              <span className="gg-brand-title">GreenGrid</span>
              <span className="gg-brand-sub">Platform</span>
              <Badge variant="frost" className="gg-event-badge">
                IBM Z Datathon 2026
              </Badge>
            </div>
            <p className="gg-brand-tagline">
              Autonomous Logistics Decision Support & Disruption Rerouting
            </p>
          </div>
        </div>

        <div className="gg-header-actions">
          <nav className="gg-header-segmented-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`gg-nav-segment ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onSelectTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`gg-nav-segment ${activeTab === "scenarios" ? "active" : ""}`}
              onClick={() => onSelectTab("scenarios")}
            >
              Disruption Matrix
            </button>
            <button
              type="button"
              className={`gg-nav-segment ${activeTab === "dataset" ? "active" : ""}`}
              onClick={() => onSelectTab("dataset")}
            >
              Dataset v2.1.1
            </button>
          </nav>

          <div className="gg-system-mode-toggle">
            <button
              type="button"
              className={`gg-mode-pill ${useMocks ? "mock" : "live"}`}
              onClick={() => onToggleMocks(!useMocks)}
              title="Click to toggle between Mock Benchmark Mode and Live Microservices"
            >
              <span className="gg-mode-dot" />
              <span className="gg-mode-text">{useMocks ? "Mock Benchmark" : "Live Backend"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
