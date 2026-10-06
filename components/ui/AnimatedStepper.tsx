'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description?: string;
}

export interface AnimatedStepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function AnimatedStepper({
  steps,
  currentStep,
  onStepClick,
  className = '',
}: AnimatedStepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full relative">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id < currentStep;

          return (
            <li
              key={step.id}
              className={`flex-1 flex flex-col items-center relative ${
                idx !== steps.length - 1 ? 'pr-4 sm:pr-8' : ''
              }`}
            >
              {/* Ligne de liaison entre étapes */}
              {idx !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-1/2 w-full h-[2px] bg-surface-muted -z-0"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              )}

              {/* Pastille circulaire animée */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 select-none ${
                  isCompleted
                    ? 'bg-accent text-accent-fg shadow-xs cursor-pointer'
                    : isCurrent
                    ? 'bg-surface text-accent border-2 border-accent ring-4 ring-accent-soft shadow-xs'
                    : 'bg-surface-muted text-fg-muted border border-line cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span>{step.id}</span>
                )}
              </button>

              {/* Titre et description de l'étape */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    isCurrent
                      ? 'text-accent font-semibold'
                      : isCompleted
                      ? 'text-fg'
                      : 'text-fg-muted'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[11px] text-fg-muted hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
