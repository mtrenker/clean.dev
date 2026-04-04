'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ links }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (open) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="nav-drawer-backdrop"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            id="mobile-nav-drawer"
            className="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex h-full flex-col px-6 py-6">
              {/* Close button */}
              <div className="mb-8 flex justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                  aria-label="Close menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation links */}
              <nav aria-label="Mobile navigation">
                <ul className="space-y-2" role="list">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={[
                          'block rounded-md px-4 py-3 font-mono text-lg uppercase tracking-wider transition-colors',
                          pathname === link.href
                            ? 'bg-accent/10 text-accent'
                            : 'text-foreground hover:bg-muted hover:text-accent',
                        ].join(' ')}
                        onClick={close}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Bottom accent line */}
              <div className="mt-auto">
                <div className="h-0.5 w-12 bg-accent" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
