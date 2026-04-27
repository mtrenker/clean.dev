import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, type, ...props }, ref) => {
    const isBooleanInput = type === 'checkbox' || type === 'radio';

    return (
      <input
        ref={ref}
        type={type}
        className={clsx(
          isBooleanInput
            ? 'rounded-sm border font-sans transition-colors'
            : 'w-full rounded-sm border px-4 py-2 font-sans transition-colors',
          'border-border bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
