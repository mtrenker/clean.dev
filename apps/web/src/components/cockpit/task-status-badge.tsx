import React from 'react';
import { Badge } from '@/components/ui';

type TaskStatus = 'pending' | 'running' | 'done' | 'failed' | 'retrying';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config: Record<TaskStatus, { variant: 'muted' | 'success' | 'warning' | 'destructive' | 'info'; label: string }> = {
    pending: { variant: 'muted', label: 'Pending' },
    running: { variant: 'info', label: 'Running' },
    done: { variant: 'success', label: 'Done' },
    failed: { variant: 'destructive', label: 'Failed' },
    retrying: { variant: 'warning', label: 'Retrying' },
  };

  const { variant, label } = config[status] ?? { variant: 'muted', label: status };

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};
