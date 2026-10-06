'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface SegmentItem {
  id: string;
  label: string;
  count: number;
  color: string; // Ex: 'bg-success-fg', 'bg-accent', etc.
  bgColor: string;
}

export interface SegmentedBarProps {
  segments: SegmentItem[];
  total: number;
  className?: string;
}

export default function SegmentedBar({ segments, total, className = '' }: SegmentedBarProps) {
  if (total === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-2 w-full rounded-full bg-surface-muted" />
        <p className="text-xs text-fg-muted">Aucune démarche enregistrée</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre segmentée avec animation motion */}
      <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden flex">
        {segments.map((seg) => {
          const percent = (seg.count / total) * 100;
          if (percent === 0) return null;

          return (
            <motion.div
              key={seg.id}
              className={`h-full ${seg.color}`}
              style={{ width: `${percent}%` }}
              title={`${seg.label} : ${seg.count} (${Math.round(percent)}%)`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </div>

      {/* Légende horizontale sobre */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        {segments.map((seg) => (
          <div key={seg.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${seg.color}`} />
            <span className="text-fg-secondary">{seg.label}</span>
            <span className="font-semibold text-fg tabular">({seg.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
