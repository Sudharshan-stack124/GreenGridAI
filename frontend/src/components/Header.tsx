import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  useMocks: boolean;
  onToggleMocks: (useMocks: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  useMocks,
  onToggleMocks,
}) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/scenarios", label: "Scenarios" },
    { to: "/dataset", label: "Dataset" },
    { to: "/analytics", label: "Analytics" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="gg-header">
      <div className="gg-header-container">
        {/* Brand Section with Logo */}
        <Link to="/" className="gg-brand-section-link">
          <div className="gg-brand-section">
            <div className="gg-brand-logo-frame">
              <img
                src={theme === "dark" ? "/greengrid-logo-white.png" : "/greengrid-logo-transparent.png"}
                alt="GreenGrid"
                className="gg-brand-logo-img"
              />
            </div>
            <div className="gg-brand-titles">
              <div className="gg-brand-name-row">
                <span className="gg-brand-title">GreenGrid</span>
                <Badge variant="frost" className="gg-event-badge">
                  v2.1 Enterprise
                </Badge>
              </div>
              <p className="gg-brand-tagline">
                Autonomous Logistics Decision Support
              </p>
            </div>
          </div>
        </Link>

        {/* Multi-Page Navigation Links */}
        <div className="gg-header-actions">
          <nav className="gg-header-segmented-nav" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`gg-nav-segment ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Apple-style Theme Switcher Pill */}
          <div className="gg-theme-switcher-pill" role="radiogroup" aria-label="Theme selection">
            <button
              type="button"
              className={`gg-theme-segment ${theme === "light" ? "active" : ""}`}
              onClick={() => theme !== "light" && toggleTheme()}
              title="Switch to Apple Light Mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark</span>
            </button>
          </div>

          {/* System Mode Toggle */}
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
