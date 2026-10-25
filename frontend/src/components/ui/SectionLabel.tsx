import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SectionLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'span' | 'div';
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  className,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={twMerge(
        clsx(
          'text-[12px] font-mono uppercase tracking-[0.06em] text-muted font-medium select-none',
          className
        )
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
