'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface RefreshButtonProps {
  className?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ className }) => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={() => router.refresh()}
      aria-label="Refresh cockpit data"
    >
      ↺ Refresh
    </Button>
  );
};
