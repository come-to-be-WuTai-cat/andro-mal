import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-accent text-[#0B0D12] font-semibold hover:bg-[#9dbfff] active:bg-[#7aa7f7] border border-transparent shadow-none',
    secondary:
      'bg-transparent text-text border border-border hover:bg-surface-2 hover:border-border-strong active:bg-surface',
    ghost:
      'bg-transparent text-muted hover:text-text hover:bg-surface-2 border border-transparent',
  }[variant];

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2 text-sm',
    lg: 'min-h-[48px] px-6 py-2.5 text-base',
  }[size];

  return (
    <button
      disabled={disabled}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          variantStyles,
          sizeStyles,
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
};
