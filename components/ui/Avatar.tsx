import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (text?: string | null) => {
    if (!text || text.trim().length === 0) return '—';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const isRealPhoto = src && !src.includes('unsplash.com') && !imageError;

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-medium select-none overflow-hidden border border-line ${
        isRealPhoto ? 'bg-surface' : 'bg-surface-muted text-fg-secondary'
      } ${sizeClasses[size]} ${className}`}
    >
      {isRealPhoto ? (
        <img
          src={src!}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
