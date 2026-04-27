import React from 'react';
import { Container } from './container';
import { Link } from './link';
import { SocialIcon } from './social-icon';

export interface FooterItem {
  href: string;
  label: string;
}

interface SocialLink {
  key: 'xing' | 'linkedin' | 'github';
  href: string;
  label: string;
  ariaLabel: string;
}

interface AppFooterProps {
  copyright: string;
  links: FooterItem[];
  socialLinks?: SocialLink[];
  actionSlot?: React.ReactNode;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  copyright,
  links,
  socialLinks,
  actionSlot,
}) => {
  return (
    <footer className="border-t border-border bg-background print:hidden">
      <Container className="flex flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-12 lg:px-24">
        <p className="text-label text-xs text-muted-foreground">{copyright}</p>
        <nav aria-label="Footer navigation" className="flex flex-col items-center gap-4 md:items-end md:gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
            {links.map((item) => (
              <Link key={item.href} href={item.href} variant="muted" className="text-label text-xs">
                {item.label}
              </Link>
            ))}
            {actionSlot}
          </div>
          {socialLinks && socialLinks.length > 0 ? (
            <div className="flex items-center justify-center gap-3 md:justify-end" aria-label="Social links">
              {socialLinks.map((item) => (
                <Link
                  ariaLabel={item.ariaLabel}
                  href={item.href}
                  key={item.href}
                  variant="muted"
                  className="inline-flex items-center justify-center rounded-sm border border-border p-2"
                  external
                >
                  <SocialIcon profile={item.key} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
      </Container>
    </footer>
  );
};
