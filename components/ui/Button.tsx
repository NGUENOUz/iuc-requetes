import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors-fast focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
    secondary: 'bg-surface-muted text-fg hover:bg-surface-hover border border-line',
    ghost: 'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg',
    destructive: 'bg-danger text-accent-fg hover:opacity-90',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[32px]',
    md: 'text-base px-3.5 py-2 min-h-[38px]',
    lg: 'text-lg px-4 py-2.5 min-h-[44px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" strokeWidth={1.5} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
