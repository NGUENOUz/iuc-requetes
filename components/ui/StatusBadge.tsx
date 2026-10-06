import React from 'react';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  children: React.ReactNode;
}

export default function StatusBadge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, string> = {
    success: 'bg-success-bg text-success-fg',
    warning: 'bg-warning-bg text-warning-fg',
    danger: 'bg-danger-bg text-danger-fg',
    info: 'bg-info-bg text-info-fg',
    neutral: 'bg-surface-muted text-fg-secondary',
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
