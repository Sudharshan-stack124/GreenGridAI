import React from "react";

export const Spinner: React.FC<{ label?: string; size?: "sm" | "md" | "lg" }> = ({
  label = "Processing...",
  size = "md",
}) => {
  return (
    <div className={`gg-spinner-container gg-spinner-${size}`} role="status" aria-live="polite">
      <div className="gg-ios-spinner">
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
        <div className="gg-spinner-blade" />
      </div>
      {label && <span className="gg-spinner-label">{label}</span>}
    </div>
  );
};
