import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = "",
}) => {
  return (
    <div className={`admin-card ${className}`}>
      {(title || headerAction) && (
        <div className="admin-card-header">
          <div className="admin-card-title-group">
            {icon && <span className="admin-card-icon">{icon}</span>}
            <div>
              {title && <h3 className="admin-card-title">{title}</h3>}
              {subtitle && <p className="admin-card-sub">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="admin-card-action">{headerAction}</div>}
        </div>
      )}
      <div className="admin-card-body">{children}</div>
    </div>
  );
};
