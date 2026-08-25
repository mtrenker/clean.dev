import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={twMerge(clsx(
          'w-full rounded-sm border px-4 py-2 font-sans transition-colors',
          'border-border bg-background text-foreground',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        ))}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
