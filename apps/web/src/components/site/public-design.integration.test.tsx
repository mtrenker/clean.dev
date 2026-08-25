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
});
