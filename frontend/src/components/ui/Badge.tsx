import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'danger' | 'warning' | 'safe' | 'info' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    danger: 'bg-danger-tint text-danger border-danger-border',
    warning: 'bg-warning-tint text-warning border-warning-border',
    safe: 'bg-safe-tint text-safe border-safe-border',
    info: 'bg-accent/10 text-accent border-accent/30',
    neutral: 'bg-surface-2 text-muted border-border',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-badge border font-mono font-medium tracking-wide',
          variantStyles[variant],
          sizeStyles,
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
