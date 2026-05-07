'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const RouteScrollReset = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/' || window.location.hash) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    // Next/browser scroll restoration can apply after the route has rendered.
    // Run once immediately and once on the next frame so the homepage link
    // reliably returns to the hero instead of restoring an old landing scroll.
    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};
