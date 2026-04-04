import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  animate = false,
  delay,
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-border bg-card p-5 text-card-foreground sm:p-6',
        animate && 'observe',
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
