import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  id,
  className = '',
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-md border bg-surface text-fg placeholder:text-fg-muted transition-colors-fast text-base py-2 px-3 ${
          error
            ? 'border-danger-fg focus:border-danger-fg focus-visible:outline-danger-fg'
            : 'border-line-strong focus:border-accent'
        } disabled:opacity-50 disabled:bg-surface-muted disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger-fg">{error}</p>}
      {!error && helperText && <p className="text-xs text-fg-muted">{helperText}</p>}
    </div>
  );
}
