import React from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Service Communication Error",
  message,
  onRetry,
}) => {
  return (
    <div className="gg-error-state" role="alert">
      <div className="gg-error-icon">⚠</div>
      <div className="gg-error-body">
        <strong>{title}</strong>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="gg-retry-btn" onClick={onRetry}>
            ↻ Retry Request
          </button>
        )}
      </div>
    </div>
  );
};
