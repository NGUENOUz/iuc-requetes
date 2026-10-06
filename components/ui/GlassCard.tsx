'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cardInteractiveProps } from '@/lib/motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'glass-raised' | 'solid';
  interactive?: boolean;
  withShine?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  variant = 'glass',
  interactive = false,
  withShine = true,
  children,
  className = '',
  ...props
}: GlassCardProps) {
  const variantClass =
    variant === 'glass-raised'
      ? 'glass-raised'
      : variant === 'solid'
      ? 'surface-solid'
      : 'glass';

  const shineClass = withShine && variant === 'glass' ? 'glass-shine' : '';

  if (interactive) {
    return (
      <motion.div
        {...cardInteractiveProps}
        className={`${variantClass} ${shineClass} cursor-pointer p-4 sm:p-6 transition-colors-fast ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${variantClass} ${shineClass} p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
