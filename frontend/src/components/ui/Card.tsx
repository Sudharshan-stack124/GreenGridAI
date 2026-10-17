import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  right,
  children,
  className = "",
  headerBorder = true,
}) => {
  return (
    <section className={`gg-card ${className}`}>
      {(title || right) && (
        <header className={`gg-card-header ${headerBorder ? "with-border" : ""}`}>
          <div className="gg-card-title-group">
            {icon && <span className="gg-card-icon">{icon}</span>}
            <div>
              {title && <h2 className="gg-card-title">{title}</h2>}
              {subtitle && <p className="gg-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {right && <div className="gg-card-right">{right}</div>}
        </header>
      )}
      <div className="gg-card-content">{children}</div>
    </section>
  );
};
