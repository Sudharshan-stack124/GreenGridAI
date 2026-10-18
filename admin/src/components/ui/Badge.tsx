import React from "react";

export type BadgeVariant = "good" | "bad" | "warn" | "frost" | "titanium" | "subtle" | "white";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "frost", children, className = "" }) => {
  return <span className={`gg-badge ${variant} ${className}`}>{children}</span>;
};
