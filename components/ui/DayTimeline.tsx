'use client';

import React from 'react';
import { Clock, MapPin } from 'lucide-react';

export interface DayCourseSlot {
  id: string;
  courseName: string;
  roomName: string;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  teacherName?: string;
  status: 'past' | 'current' | 'upcoming';
}

export interface DayTimelineProps {
  slots?: DayCourseSlot[];
  currentTimeString?: string; // "09:15"
  onSelectSlot?: (slot: DayCourseSlot) => void;
  className?: string;
}

export default function DayTimeline({
  slots = [],
  currentTimeString = '09:15',
  onSelectSlot,
  className = '',
}: DayTimelineProps) {
  // Calcul approximatif du pourcentage de la journée (7h à 19h = 12h = 720 minutes)
  const getMinutesFrom7h = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + (m || 0);
    const startMinutes = 7 * 60;
    return Math.max(0, Math.min(720, totalMinutes - startMinutes));
  };

  const currentPercent = (getMinutesFrom7h(currentTimeString) / 720) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span className="flex items-center gap-1.5 font-medium text-fg">
          <Clock size={14} className="text-accent" strokeWidth={1.5} />
          <span>Journée académique</span>
        </span>
        <span className="tabular font-mono text-accent font-semibold">
          Actuellement {currentTimeString}
        </span>
      </div>

      {/* Frise horaire */}
      <div className="relative pt-6 pb-2">
        {/* Ligne d'axe temporelle */}
        <div className="h-1 w-full bg-surface-muted rounded-full relative overflow-hidden">
          <div
            className="h-full bg-accent/40 rounded-full"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Repère "maintenant" */}
        <div
          className="absolute top-2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
          style={{ left: `${currentPercent}%` }}
        >
          <span className="text-[10px] font-semibold text-accent bg-accent-soft px-1.5 py-0.2 rounded-full border border-accent/20">
            Maintenant
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent-soft mt-0.5" />
        </div>

        {/* Repères horaires (8h, 12h, 16h, 18h) */}
        <div className="flex justify-between text-[10px] text-fg-muted font-mono pt-2">
          <span>08h</span>
          <span>10h</span>
          <span>12h</span>
          <span>14h</span>
          <span>16h</span>
          <span>18h</span>
        </div>
      </div>

      {/* Cartes des séances de la journée */}
      {slots.length === 0 ? (
        <div className="p-4 rounded-md bg-surface-muted/50 text-center text-xs text-fg-muted">
          Pas de cours programmé aujourd&apos;hui.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {slots.map((slot) => {
            const isCurrent = slot.status === 'current';
            const isPast = slot.status === 'past';

            return (
              <div
                key={slot.id}
                onClick={() => onSelectSlot && onSelectSlot(slot)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'glass border-accent/60 shadow-md ring-1 ring-accent/30'
                    : isPast
                    ? 'bg-surface-muted/60 border-line/40 opacity-70'
                    : 'glass hover:border-line-strong'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-fg-secondary font-medium tabular">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-accent text-accent-fg font-semibold px-2 py-0.5 rounded-full">
                      En cours
                    </span>
                  )}
                  {slot.status === 'upcoming' && (
                    <span className="text-[10px] text-fg-muted">À venir</span>
                  )}
                </div>

                <p className="text-sm font-semibold text-fg truncate">
                  {slot.courseName}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/50 text-xs text-fg-muted">
                  <span className="flex items-center gap-1 font-medium text-fg-secondary">
                    <MapPin size={13} className="text-accent" strokeWidth={1.5} />
                    {slot.roomName}
                  </span>
                  {slot.teacherName && (
                    <span className="truncate max-w-[120px] text-[11px]">
                      {slot.teacherName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
