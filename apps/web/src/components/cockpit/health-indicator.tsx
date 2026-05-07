import React from 'react';
import { Badge } from '@/components/ui';

/**
 * Displays daemon health as a coloured badge.
 *
 * - active   (green)  : heartbeat received within the stale window
 * - stale    (yellow) : heartbeat received at some point but now overdue
 * - offline  (gray)   : heartbeat never received
 */
export type DaemonHealth = 'active' | 'stale' | 'offline';

interface HealthIndicatorProps {
  health: DaemonHealth;
  className?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  health,
  className,
}) => {
  const config = {
    active: {
      variant: 'success' as const,
      label: 'Active',
      dot: 'bg-success',
    },
    stale: {
      variant: 'warning' as const,
      label: 'Stale',
      dot: 'bg-warning',
    },
    offline: {
      variant: 'muted' as const,
      label: 'Offline',
      dot: 'bg-foreground/30',
    },
  };

  const { variant, label, dot } = config[health];

  return (
    <Badge variant={variant} className={className}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </Badge>
  );
};

/**
 * Derives daemon health from projected state fields.
 *
 * @param dirty           `state.dirty` from projected state (true = daemon stale)
 * @param hasHeartbeat    whether `state.lastHeartbeat` is non-null
 */
export function getDaemonHealth(
  dirty: boolean,
  hasHeartbeat: boolean,
): DaemonHealth {
  if (!dirty) return 'active';
  if (hasHeartbeat) return 'stale';
  return 'offline';
}
