import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { ExternalIcon } from "./ui/Icons";
import { useTheme } from "../context/ThemeContext";

export const AdminHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <div className="admin-brand-section">
          <Link to="/" className="admin-brand-link">
            <span className="admin-brand-title">Green Grid</span>
            <span className="admin-brand-portal-tag">Admin Console</span>
          </Link>
          <Badge variant="titanium" className="admin-status-badge">
            Operator v2.1
          </Badge>
        </div>

        <div className="admin-header-right">
          {/* User Dashboard External Link */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-switch-btn"
            title="Open GreenGrid User Dashboard in new tab"
          >
            <span>User Dashboard</span>
            <ExternalIcon size={14} />
          </a>

          {/* Theme Switcher Pill */}
          <div className="gg-theme-switcher-pill" role="radiogroup" aria-label="Theme selection">
            <button
              type="button"
              className={`gg-theme-segment ${theme === "light" ? "active" : ""}`}
              onClick={() => theme !== "light" && toggleTheme()}
              title="Switch to Apple Light Mode"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>Light</span>
            </button>
            <button
              type="button"
              className={`gg-theme-segment ${theme === "dark" ? "active" : ""}`}
              onClick={() => theme !== "dark" && toggleTheme()}
              title="Switch to Apple Dark Mode"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark</span>
            </button>
          </div>

          <div className="admin-live-pulse">
            <span className="admin-pulse-dot" />
            <span className="admin-pulse-text">Live Telemetry</span>
          </div>
        </div>
      </div>
    </header>
  );
};
