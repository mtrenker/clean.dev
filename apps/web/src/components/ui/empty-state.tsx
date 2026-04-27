import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={clsx('rounded-sm border border-dashed border-border bg-muted/20 p-6 text-center', className)}>
      <h3 className="font-serif text-xl font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
