'use client';

import React, { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ScrollReveal wires up the `.observe` → `.animate-in` scroll-transition pattern
 * for every descendant that carries the `.observe` class.
 *
 * Drop a single <ScrollReveal> around the page content (or any subtree that
 * contains `.observe` elements) instead of duplicating the IntersectionObserver
 * boilerplate in every page component.
 *
 * The wrapper div is `display:contents` by default so it has no visual footprint
 * and does not interfere with flex/grid parent layouts.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = ref.current?.querySelectorAll('.observe') ?? [];

    // Scroll reveal is progressive enhancement. Content is visible by default;
    // this class opts into hidden-until-observed only after the client script runs.
    document.documentElement.classList.add('supports-scroll-reveal');

    // Respect reduced motion and older browsers by keeping everything visible.
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      elements.forEach((el) => el.classList.add('animate-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ?? 'contents'}>
      {children}
    </div>
  );
};
