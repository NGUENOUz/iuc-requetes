import React from 'react';
import StatusBadge, { StatusVariant } from './StatusBadge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  children: React.ReactNode;
}

export default function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  let mappedVariant: StatusVariant = 'neutral';
  if (variant === 'success') mappedVariant = 'success';
  if (variant === 'warning') mappedVariant = 'warning';
  if (variant === 'danger') mappedVariant = 'danger';
  if (variant === 'info') mappedVariant = 'info';

  return (
    <StatusBadge variant={mappedVariant} className={className} {...props}>
      {children}
    </StatusBadge>
  );
}
