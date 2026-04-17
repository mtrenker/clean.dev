import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'accent' | 'muted' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'muted',
}) => {
  const variantClasses = {
    accent: 'border-accent/30 bg-accent/10 text-accent',
    muted: 'border-foreground/20 bg-foreground/5 text-foreground/70',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
    info: 'border-info/30 bg-info/10 text-info',
    outline: 'border-border bg-transparent text-foreground',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border px-2 py-1 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
