import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLink } from './public-design';

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
});
