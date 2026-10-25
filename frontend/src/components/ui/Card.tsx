import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-2' | 'dashed' | 'danger' | 'safe';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'surface',
  noPadding = false,
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-surface border-border',
    'surface-2': 'bg-surface-2 border-border',
    dashed: 'bg-surface/50 border-border-strong border-dashed',
    danger: 'bg-danger-tint border-danger-border',
    safe: 'bg-safe-tint border-safe-border',
  }[variant];

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-card border text-text transition-colors duration-150',
          !noPadding && 'p-5 sm:p-6',
          variantStyles,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
