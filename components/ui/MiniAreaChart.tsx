'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  label: string; // Ex: 'S1', 'S2', 'S3', 'S4', 'S5'
  value: number; // Ex: 14.2, 14.8, 15.1, 15.8
}

export interface MiniAreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
}

export default function MiniAreaChart({
  data,
  height = 140,
  className = '',
}: MiniAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center rounded-lg bg-surface-muted/30 text-xs text-fg-muted ${className}`}
      >
        Données d&apos;évolution insuffisantes
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="chartAccentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            stroke="var(--fg-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[10, 20]}
            stroke="var(--fg-muted)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            ticks={[10, 15, 20]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="rounded-md bg-surface border border-line px-2.5 py-1.5 shadow-overlay text-xs">
                    <p className="font-semibold text-fg">
                      {item.payload.label} : {item.value} / 20
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#chartAccentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
