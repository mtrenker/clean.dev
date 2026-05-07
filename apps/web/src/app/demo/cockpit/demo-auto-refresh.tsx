'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DemoAutoRefreshProps {
  intervalMs?: number;
}

export const DemoAutoRefresh: React.FC<DemoAutoRefreshProps> = ({
  intervalMs = 5000,
}) => {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, router]);

  return null;
};
