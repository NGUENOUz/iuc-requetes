import React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-medium text-fg">{title}</h4>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
