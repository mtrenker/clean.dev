'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface MobileNavProps {
  items: Array<{ href: string; label: string }>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  /* Trap focus inside drawer */
  useEffect(() => {
    if (!open || !drawerRef.current) return;

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [open]);

  return (
    <>
      {/* Hamburger trigger — only visible on mobile */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
      >
        <span className="block h-0.5 w-6 bg-foreground transition-transform" />
        <span className="block h-0.5 w-6 bg-foreground transition-opacity" />
        <span className="block h-0.5 w-6 bg-foreground transition-transform" />
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 z-[90] md:hidden" role="dialog" aria-modal="true">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            style={{ animation: 'overlayFadeIn 200ms ease-out' }}
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            id="mobile-drawer"
            ref={drawerRef}
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-background shadow-2xl"
            style={{ animation: 'drawerSlideIn 250ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
          >
            <div className="flex items-center justify-end px-6 py-5">
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center text-foreground"
                aria-label="Close navigation menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <ul className="flex flex-col gap-2 px-6">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block rounded px-4 py-3 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-muted hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};
