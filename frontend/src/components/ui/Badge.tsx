import React from "react";

export type BadgeVariant = "good" | "bad" | "warn" | "neutral" | "brand" | "cyan";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "", icon }) => {
  return (
    <span className={`gg-badge gg-badge-${variant} ${className}`}>
      {icon && <span className="gg-badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export const ModeBadge: React.FC<{ mode: string }> = ({ mode }) => {
  const m = mode.toLowerCase();
  let variant: BadgeVariant = "neutral";
  let symbol = "📦";

  if (m.includes("air")) {
    variant = "cyan";
    symbol = "✈";
  } else if (m.includes("road")) {
    variant = "warn";
    symbol = "🚛";
  } else if (m.includes("rail")) {
    variant = "good";
    symbol = "🚆";
  } else if (m.includes("sea")) {
    variant = "brand";
    symbol = "🚢";
  }

  return (
    <Badge variant={variant} className="gg-mode-badge" icon={<span style={{ marginRight: 4 }}>{symbol}</span>}>
      {mode}
    </Badge>
  );
};
