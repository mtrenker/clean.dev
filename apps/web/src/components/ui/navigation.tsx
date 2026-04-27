import React from 'react';
import clsx from 'clsx';
import { Container } from './container';
import { Link } from './link';
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
    <header className={clsx('sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm print:hidden', className)}>
      <Container className="px-6 py-4 md:px-12 lg:px-24">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">{brand}</div>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {socialItems && socialItems.length > 0 ? (
              <ul className="hidden shrink-0 items-center gap-3 md:flex" role="list" aria-label="Social links">
                {socialItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      ariaLabel={item.ariaLabel}
                      className="inline-flex items-center justify-center rounded-sm border border-border p-2 transition-colors hover:border-accent hover:text-accent"
                      external
                      variant="muted"
                    >
                      <SocialIcon profile={item.key} />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {rightSlot ? <div className="flex shrink-0 items-center gap-2">{rightSlot}</div> : null}
          </div>
        </div>
        <nav aria-label="Main navigation" className="mt-4 md:mt-3">
          <ul className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 md:gap-8" role="list">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} variant="nav">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
};
