import type { ReactNode } from 'react';

export const Spinner = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="spinner-wrap" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="empty">
    <div className="empty__icon" aria-hidden="true">
      🛒
    </div>
    <h3 className="empty__title">{title}</h3>
    <p className="empty__message">{message}</p>
    {action}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="empty empty--error" role="alert">
    <h3 className="empty__title">Something went wrong</h3>
    <p className="empty__message">{message}</p>
    {onRetry && (
      <button type="button" className="btn btn--secondary btn--md" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const Badge = ({ children }: { children: ReactNode }) => (
  <span className="badge">{children}</span>
);
