'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import GlassCard from './GlassCard';
import { DURATION, EASE } from '@/lib/motion';

export interface StatTileProps {
  label: string;
  value: number | string;
  suffix?: string;
  numericValue?: number;
  variation?: { text: string; positive?: boolean };
  context?: string;
  interactive?: boolean;
  className?: string;
}

export default function StatTile({
  label,
  value,
  suffix = '',
  numericValue,
  variation,
  context,
  interactive = false,
  className = '',
}: StatTileProps) {
  const prefersReduced = useReducedMotion();
  const [displayNumber, setDisplayNumber] = useState(
    numericValue !== undefined && !prefersReduced ? 0 : numericValue
  );

  useEffect(() => {
    if (numericValue === undefined || prefersReduced) return;

    let start = 0;
    const durationMs = 600;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (numericValue - start) * eased;
      setDisplayNumber(Number(current.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayNumber(numericValue);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [numericValue, prefersReduced]);

  const renderedValue =
    numericValue !== undefined && !prefersReduced
      ? displayNumber
      : value;

  return (
    <GlassCard interactive={interactive} className={`flex flex-col justify-between min-w-0 overflow-hidden ${className}`}>
      <div className="min-w-0">
        <p className="text-xs text-fg-muted font-normal tracking-normal truncate">{label}</p>
        <div className="flex items-baseline gap-1 mt-2 min-w-0">
          <span
            className={`font-bold text-fg tabular font-title leading-tight break-words hyphens-auto min-w-0 ${
              typeof renderedValue === 'string' && renderedValue.length > 12
                ? 'text-base sm:text-lg font-bold leading-snug'
                : typeof renderedValue === 'string' && renderedValue.length > 7
                ? 'text-xl sm:text-2xl font-bold'
                : 'text-3xl sm:text-4xl tracking-tight'
            }`}
          >
            {renderedValue}
          </span>
          {suffix && (
            <span className="text-sm font-normal text-fg-muted shrink-0">{suffix}</span>
          )}
        </div>
      </div>

      {(variation || context) && (
        <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
          {variation && (
            <span
              className={`font-medium ${
                variation.positive
                  ? 'text-success-fg'
                  : 'text-fg-secondary'
              }`}
            >
              {variation.text}
            </span>
          )}
          {context && <span className="text-fg-muted truncate">{context}</span>}
        </div>
      )}
    </GlassCard>
  );
}
