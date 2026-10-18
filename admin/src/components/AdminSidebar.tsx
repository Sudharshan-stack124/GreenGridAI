import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  ShipmentsIcon,
  DisruptionIcon,
  LeafIcon,
  LogsIcon,
} from "./ui/Icons";

export const AdminSidebar: React.FC = () => {
  const navItems = [
    { to: "/", label: "Overview", icon: <DashboardIcon size={18} /> },
    { to: "/shipments", label: "Corridors (27)", icon: <ShipmentsIcon size={18} /> },
    { to: "/disruptions", label: "Disruptions", icon: <DisruptionIcon size={18} /> },
    { to: "/emission-factors", label: "DEFRA Factors", icon: <LeafIcon size={18} /> },
    { to: "/audit-logs", label: "Audit Stream", icon: <LogsIcon size={18} /> },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-section-title">Operations Console</div>
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            <span className="admin-sidebar-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-status-box">
          <div className="admin-sidebar-status-title">System Health</div>
          <div className="admin-sidebar-status-desc">Zero Infeasible Routes</div>
          <div className="admin-sidebar-status-sub">Dataset v2.1.1 Frozen</div>
        </div>
      </div>
    </aside>
  );
};
