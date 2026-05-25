'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { Link } from './link';
import type { NavigationItem } from './navigation';

type NavigationLinksProps = {
  items: NavigationItem[];
  variant: 'desktop' | 'mobile';
};

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const NavigationLinks = ({ items, variant }: NavigationLinksProps) => {
  const pathname = usePathname();

  return (
    <ul
      className={clsx(
        'flex items-center',
        variant === 'desktop' && 'gap-1 rounded-full border border-[var(--site-rule)] bg-[var(--site-panel)] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.22)]',
        variant === 'mobile' && 'gap-1 rounded-full border border-[var(--site-rule)] bg-[var(--site-panel)] p-1.5 shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-md',
      )}
      role="list"
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              variant="unstyled"
              ariaLabel={item.label}
              ariaCurrent={active ? 'page' : undefined}
              className={clsx(
                'relative inline-flex items-center justify-center rounded-full font-mono font-bold uppercase transition-all duration-200',
                'focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-[var(--site-bg)]',
                variant === 'desktop' && 'px-4 py-2 text-[0.68rem] tracking-[0.18em]',
                variant === 'mobile' && 'min-w-[5.4rem] px-3 py-3 text-[0.66rem] tracking-[0.13em]',
                active
                  ? 'bg-[var(--site-rust)] !text-[var(--site-bg)] shadow-[0_0_0_1px_rgba(217,110,63,0.34),0_8px_22px_rgba(217,110,63,0.24)] hover:!text-[var(--site-bg)]'
                  : 'text-[var(--site-ink-sec)] hover:bg-[var(--site-rule)] hover:text-[var(--site-ink)]',
              )}
            >
              {active ? (
                <span aria-hidden="true" className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              ) : null}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
