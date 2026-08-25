import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={twMerge(clsx(
          'w-full rounded-sm border px-4 py-2 font-sans transition-colors',
          'border-border bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
          hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        ))}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
