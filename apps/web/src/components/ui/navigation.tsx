import React from 'react';
import clsx from 'clsx';
import { Link } from './link';
import { NavigationLinks } from './navigation-links';
import { SocialIcon } from './social-icon';

export interface NavigationItem {
  href: string;
  label: string;
}

interface SocialLink {
  key: 'xing' | 'linkedin' | 'github';
  href: string;
  label: string;
  ariaLabel: string;
}

interface AppNavigationProps {
  brand: React.ReactNode;
  items: NavigationItem[];
  socialItems?: SocialLink[];
  rightSlot?: React.ReactNode;
  className?: string;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  brand,
  items,
  socialItems,
  rightSlot,
  className,
}) => {
  return (
    <>
      <header className={clsx('sticky top-0 z-50 border-b border-[var(--site-rule)] bg-[var(--site-bg)] backdrop-blur-md print:hidden', className)}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--site-rust)] to-transparent" aria-hidden="true" />
        <div className="mx-auto grid max-w-[90rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 md:px-14">
          <div className="min-w-0 shrink-0">{brand}</div>

          <nav aria-label="Main navigation" className="hidden justify-self-center md:block">
            <NavigationLinks items={items} variant="desktop" />
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3">
            {socialItems && socialItems.length > 0 ? (
              <ul className="hidden shrink-0 items-center gap-2 lg:flex" role="list" aria-label="Social links">
                {socialItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      ariaLabel={item.ariaLabel}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--site-rule)] transition-colors hover:border-[var(--site-rust)] hover:text-[var(--site-rust)]"
                      external
                      variant="muted"
                    >
                      <SocialIcon profile={item.key} className="h-4 w-4" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {rightSlot ? <div className="flex shrink-0 items-center gap-2">{rightSlot}</div> : null}
          </div>
        </div>
      </header>

      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 md:hidden print:hidden">
        <NavigationLinks items={items} variant="mobile" />
      </nav>
    </>
  );
};
