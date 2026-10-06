import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-muted rounded-md animate-pulse ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
