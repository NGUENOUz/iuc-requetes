import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  glass = true
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  return (
    <div 
      className={`
        rounded-2xl
        ${glass ? 'glass-card' : 'bg-white border border-slate-100 shadow-sm'}
        ${paddings[padding]} 
        ${hover ? (glass ? 'glass-card-hover' : 'transition-smooth hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200/80') : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pb-3 border-b border-slate-100/70 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-base font-semibold text-neutral-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pt-3 ${className}`}>
      {children}
    </div>
  );
}
