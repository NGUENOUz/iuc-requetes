import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-fg-muted">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-md border bg-surface text-fg placeholder:text-fg-muted transition-colors-fast text-base py-2 ${
            leftIcon ? 'pl-9' : 'pl-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} ${
            error
              ? 'border-danger-fg focus:border-danger-fg focus-visible:outline-danger-fg'
              : 'border-line-strong focus:border-accent'
          } disabled:opacity-50 disabled:bg-surface-muted disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-fg-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger-fg">{error}</p>}
      {!error && helperText && <p className="text-xs text-fg-muted">{helperText}</p>}
    </div>
  );
}
