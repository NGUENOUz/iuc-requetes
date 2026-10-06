import React from 'react';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  className?: string;
}

export default function StatCard({ label, value, context, className = '' }: StatCardProps) {
  return (
    <div className={`rounded-lg bg-surface border border-line p-4 ${className}`}>
      <p className="text-xs text-fg-muted font-normal">{label}</p>
      <p className="text-2xl font-semibold text-fg tabular mt-1">{value}</p>
      {context && <p className="text-xs text-fg-secondary mt-1">{context}</p>}
    </div>
  );
}
