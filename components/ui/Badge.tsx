import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50/70 text-emerald-700 border-emerald-100/60',
    warning: 'bg-amber-50/70 text-amber-700 border-amber-100/60',
    error: 'bg-rose-50/70 text-rose-700 border-rose-100/60',
    info: 'bg-sky-50/70 text-sky-700 border-sky-100/60',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200/50',
    primary: 'bg-primary-50/70 text-primary-700 border-primary-100/60',
  };
  
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold leading-none',
    md: 'text-xs px-2.5 py-1 font-semibold leading-none',
  };
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        ${variants[variant]} 
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
