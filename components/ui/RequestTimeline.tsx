'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, X } from 'lucide-react';

export interface TimelineStep {
  id: string;
  label: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
}

export interface RequestTimelineProps {
  steps?: TimelineStep[];
  statusSentence?: string;
  variant?: 'compact' | 'detailed';
  isRejected?: boolean;
  className?: string;
}

export default function RequestTimeline({
  steps,
  statusSentence,
  variant = 'compact',
  isRejected = false,
  className = '',
}: RequestTimelineProps) {
  // Étapes par défaut si non fournies
  const defaultSteps: TimelineStep[] = [
    { id: '1', label: 'Déposée', date: 'Lun 12', status: 'completed' },
    { id: '2', label: 'Prise en charge', date: 'Mar 13', status: isRejected ? 'rejected' : 'current' },
    { id: '3', label: isRejected ? 'Rejetée' : 'Traitée', date: undefined, status: isRejected ? 'rejected' : 'upcoming' },
  ];

  const currentSteps = steps || defaultSteps;

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {statusSentence && (
          <p className="text-xs text-fg-secondary leading-snug">{statusSentence}</p>
        )}
        <ol className="flex items-center gap-1.5 sm:gap-2 w-full" aria-label="Progression de la requête">
          {currentSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isRejectedStep = step.status === 'rejected';

            return (
              <li
                key={step.id}
                className="flex-1 flex flex-col gap-1"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center gap-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      isCompleted
                        ? 'bg-fg-secondary'
                        : isCurrent
                        ? 'bg-accent'
                        : isRejectedStep
                        ? 'bg-danger-fg'
                        : 'bg-surface-muted border border-line/50'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] leading-tight">
                  <span
                    className={`font-medium truncate ${
                      isCurrent
                        ? 'text-accent font-semibold'
                        : isRejectedStep
                        ? 'text-danger-fg font-semibold'
                        : isCompleted
                        ? 'text-fg'
                        : 'text-fg-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.date && (
                    <span className="text-fg-muted text-[10px] hidden sm:inline tabular">
                      {step.date}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // Version détaillée (verticale pour fiche requête)
  return (
    <div className={`space-y-4 ${className}`}>
      {statusSentence && (
        <div className="p-3 rounded-md bg-accent-soft text-accent-text text-xs font-medium">
          {statusSentence}
        </div>
      )}
      <ol className="relative border-l border-line ml-3 space-y-6" aria-label="Historique complet">
        {currentSteps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isRejectedStep = step.status === 'rejected';

          return (
            <li
              key={step.id}
              className="ml-6 relative"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  isCompleted
                    ? 'bg-fg text-surface'
                    : isCurrent
                    ? 'bg-accent text-accent-fg ring-4 ring-accent-soft'
                    : isRejectedStep
                    ? 'bg-danger text-accent-fg'
                    : 'bg-surface-muted text-fg-muted border border-line'
                }`}
              >
                {isCompleted ? (
                  <Check size={11} strokeWidth={2.5} />
                ) : isRejectedStep ? (
                  <X size={11} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Clock size={11} strokeWidth={2} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-fg-muted" />
                )}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-accent font-semibold'
                        : isRejectedStep
                        ? 'text-danger-fg'
                        : 'text-fg'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] bg-accent-soft text-accent-text px-1.5 py-0.2 rounded-full font-medium">
                      En cours
                    </span>
                  )}
                </div>
                {step.date && (
                  <p className="text-xs text-fg-muted mt-0.5 tabular">{step.date}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
