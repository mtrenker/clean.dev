import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLink, SiteSection } from './public-design';

describe('public design primitives', () => {
  it('uses the accessible public-site colour pair for primary actions', () => {
    render(<ButtonLink href="/contact">Contact</ButtonLink>);

    const action = screen.getByRole('link', { name: 'Contact' });
    expect(action.classList.contains('bg-[var(--site-rust)]')).toBe(true);
    expect(action.classList.contains('text-[var(--site-bg)]')).toBe(true);
    expect(action.classList.contains('text-foreground')).toBe(false);
  });

  it('marks external actions and preserves their accessible label', () => {
    render(
      <ButtonLink href="https://example.com" external ariaLabel="Book a call (opens in a new tab)">
        Book a call
      </ButtonLink>,
    );

    const action = screen.getByRole('link', { name: 'Book a call (opens in a new tab)' });
    expect(action.getAttribute('href')).toBe('https://example.com');
    expect(action.getAttribute('target')).toBe('_blank');
    expect(action.getAttribute('rel')).toBe('noreferrer noopener');
  });

  it('exposes SiteSection as an addressable, focusable region', () => {
    render(
      <SiteSection id="how-i-help" ariaLabelledBy="home-help-heading" tabIndex={-1}>
        <h2 id="home-help-heading">How I help</h2>
      </SiteSection>,
    );

    const section = screen.getByRole('region', { name: 'How I help' });
    expect(section.getAttribute('id')).toBe('how-i-help');
    expect(section.getAttribute('aria-labelledby')).toBe('home-help-heading');
    expect(section.getAttribute('tabindex')).toBe('-1');
  });
});
