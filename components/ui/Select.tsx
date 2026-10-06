import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export default function Select({
  label,
  error,
  helperText,
  options,
  id,
  children,
  className = '',
  disabled,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        className={`w-full rounded-md border bg-surface text-fg transition-colors-fast text-base py-2 px-3 ${
          error
            ? 'border-danger-fg focus:border-danger-fg focus-visible:outline-danger-fg'
            : 'border-line-strong focus:border-accent'
        } disabled:opacity-50 disabled:bg-surface-muted disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-xs text-danger-fg">{error}</p>}
      {!error && helperText && <p className="text-xs text-fg-muted">{helperText}</p>}
    </div>
  );
}
