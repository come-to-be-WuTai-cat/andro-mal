import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  isRisky?: boolean;
  subtext?: string;
  isLast?: boolean;
}

export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  isRisky = false,
  subtext,
  isLast = false,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-between py-2.5 text-sm',
          !isLast && 'border-b border-border/80',
          className
        )
      )}
      {...props}
    >
      <div className="flex flex-col">
        <span className="text-muted text-sm">{label}</span>
        {subtext && <span className="text-[11px] text-muted/70 font-mono mt-0.5">{subtext}</span>}
      </div>

      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'font-mono tabular-nums font-medium text-sm',
            isRisky ? 'text-danger font-semibold' : 'text-text'
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
};
