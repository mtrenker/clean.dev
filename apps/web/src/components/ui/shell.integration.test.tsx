import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppFooter } from './footer';
import { Link } from './link';
import { AppNavigation } from './navigation';

describe('shared shell integration', () => {
  it('renders public navigation with social links and external attributes', () => {
    render(
      <AppNavigation
        brand={<Link href="/">clean.dev</Link>}
        items={[
          { href: '/work', label: 'Portfolio' },
          { href: '/blog', label: 'Blog' },
          { href: '/contact', label: 'Contact' },
        ]}
        socialItems={[
          { key: 'linkedin', href: 'https://www.linkedin.com/in/martin-trenker', label: 'LinkedIn', ariaLabel: 'Visit LinkedIn profile' },
          { key: 'github', href: 'https://github.com/martin-trenker', label: 'GitHub', ariaLabel: 'Visit GitHub profile' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Portfolio' }).getAttribute('href')).toBe('/work');
    expect(screen.getByRole('link', { name: 'Blog' }).getAttribute('href')).toBe('/blog');
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact');

    const socialRegion = screen.getByLabelText('Social links');
    const linkedIn = within(socialRegion).getByRole('link', { name: 'Visit LinkedIn profile' });
    expect(linkedIn.getAttribute('href')).toBe('https://www.linkedin.com/in/martin-trenker');
    expect(linkedIn.getAttribute('target')).toBe('_blank');
    expect(linkedIn.getAttribute('rel')).toBe('noreferrer noopener');
  });

  it('renders footer legal pages and social links', () => {
    render(
      <AppFooter
        copyright="© 2026 clean.dev"
        links={[
          { href: '/contact', label: 'Contact' },
          { href: '/imprint', label: 'Legal' },
          { href: '/privacy', label: 'Privacy Policy' },
        ]}
        socialLinks={[
          { key: 'xing', href: 'https://www.xing.com/search?type=users&keywords=Martin%20Trenker', label: 'XING', ariaLabel: 'Visit XING profile' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Legal' }).getAttribute('href')).toBe('/imprint');
    expect(screen.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: 'Visit XING profile' }).getAttribute('href')).toBe(
      'https://www.xing.com/search?type=users&keywords=Martin%20Trenker',
    );
  });

  it('hides social section fallback when no social links are provided', () => {
    const { container } = render(
      <>
        <AppNavigation
          brand={<Link href="/">clean.dev</Link>}
          items={[
            { href: '/work', label: 'Portfolio' },
            { href: '/blog', label: 'Blog' },
          ]}
        />
        <AppFooter
          copyright="© 2026 clean.dev"
          links={[{ href: '/imprint', label: 'Legal' }]}
        />
      </>,
    );

    expect(screen.queryAllByLabelText('Social links')).toHaveLength(0);
    expect(container).toMatchSnapshot();
  });
});
