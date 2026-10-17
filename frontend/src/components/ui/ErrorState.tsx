import React from "react";
import { ShieldAlertIcon } from "./Icons";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Connection Error",
  message,
  onRetry,
}) => {
  return (
    <div className="gg-error-state" role="alert">
      <div className="gg-error-icon">
        <ShieldAlertIcon size={18} />
      </div>
      <div className="gg-error-body">
        <strong>{title}</strong>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="gg-retry-btn" onClick={onRetry}>
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
};
