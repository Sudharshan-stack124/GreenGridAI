import React from "react";

export const Spinner: React.FC<{ label?: string; size?: "sm" | "md" | "lg" }> = ({
  label = "Processing...",
  size = "md",
}) => {
  return (
    <div className={`gg-spinner-container gg-spinner-${size}`} role="status" aria-live="polite">
      <div className="gg-radar-spinner">
        <div className="gg-spinner-ring" />
        <div className="gg-spinner-core" />
      </div>
      {label && <span className="gg-spinner-label">{label}</span>}
    </div>
  );
};
