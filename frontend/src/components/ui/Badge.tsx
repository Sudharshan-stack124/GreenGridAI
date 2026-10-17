import React from "react";
import { PlaneIcon, TruckIcon, TrainIcon, ShipIcon } from "./Icons";

export type BadgeVariant = "white" | "frost" | "titanium" | "subtle" | "neutral" | "good" | "bad" | "warn" | "brand" | "cyan";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "frost",
  className = "",
  icon,
}) => {
  return (
    <span className={`gg-badge gg-badge-${variant} ${className}`}>
      {icon && <span className="gg-badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export const ModeBadge: React.FC<{ mode: string }> = ({ mode }) => {
  const m = mode.toLowerCase();
  let icon = <PlaneIcon size={12} />;

  if (m.includes("air")) {
    icon = <PlaneIcon size={12} />;
  } else if (m.includes("road")) {
    icon = <TruckIcon size={12} />;
  } else if (m.includes("rail")) {
    icon = <TrainIcon size={12} />;
  } else if (m.includes("sea")) {
    icon = <ShipIcon size={12} />;
  }

  return (
    <Badge variant="frost" className="gg-mode-badge" icon={icon}>
      {mode}
    </Badge>
  );
};
