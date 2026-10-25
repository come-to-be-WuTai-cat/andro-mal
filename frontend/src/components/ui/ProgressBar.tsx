import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'accent' | 'danger' | 'safe';
  height?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'accent',
  height = 'h-1.5',
  label = 'Progress',
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barStyles = {
    accent: 'bg-accent',
    danger: 'bg-danger',
    safe: 'bg-safe',
  }[variant];

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={twMerge(
        clsx(
          'w-full bg-surface-2 border border-border/60 rounded-full overflow-hidden p-[1px]',
          height,
          className
        )
      )}
      {...props}
    >
      <div
        className={twMerge(
          clsx(
            'h-full rounded-full transition-all duration-300 ease-out',
            barStyles
          )
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
