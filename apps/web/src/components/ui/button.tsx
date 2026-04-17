import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-foreground text-background hover:bg-accent',
      secondary: 'border border-border bg-transparent text-foreground hover:bg-foreground hover:text-background',
      ghost: 'border border-transparent bg-transparent text-foreground hover:bg-muted',
      destructive: 'border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-8 py-4 text-sm',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-md font-mono uppercase tracking-wider transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
