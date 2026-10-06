'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface ProgressRingProps {
  value: number;       // Ex: 22
  total: number;       // Ex: 30
  label?: string;
  size?: number;       // Diamètre en px
  strokeWidth?: number;
  className?: string;
}

export default function ProgressRing({
  value,
  total,
  label = 'Crédits validés',
  size = 110,
  strokeWidth = 10,
  className = '',
}: ProgressRingProps) {
  const prefersReduced = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Cercle d'arrière-plan */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--surface-muted)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Cercle de progression animé */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: prefersReduced ? 0 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Valeur centrale */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-fg tabular font-title">
            {value}
          </span>
          <span className="text-[10px] text-fg-muted">/ {total}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-fg-muted font-normal">{label}</p>
        <p className="text-sm font-semibold text-fg tabular">
          {Math.round(percent)} % validés
        </p>
        <p className="text-xs text-fg-secondary">
          {total - value > 0 ? `${total - value} crédits restants` : 'Cycle validé'}
        </p>
      </div>
    </div>
  );
}
