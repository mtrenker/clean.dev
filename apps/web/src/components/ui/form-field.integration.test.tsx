import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';

describe('form primitives', () => {
  it('lets public theme classes replace primitive colour utilities', () => {
    render(
      <>
        <Label className="text-[var(--site-ink)]" htmlFor="name">Name</Label>
        <Input
          id="name"
          className="bg-[var(--site-bg)] text-[var(--site-ink)]"
        />
        <Textarea
          aria-label="Message"
          className="bg-[var(--site-bg)] text-[var(--site-ink)]"
        />
      </>
    );

    const labelClasses = screen.getByText('Name').classList;
    expect(labelClasses.contains('text-[var(--site-ink)]')).toBe(true);
    expect(labelClasses.contains('text-foreground')).toBe(false);

    for (const control of [
      screen.getByRole('textbox', { name: 'Name' }),
      screen.getByRole('textbox', { name: 'Message' }),
    ]) {
      expect(control.classList.contains('bg-[var(--site-bg)]')).toBe(true);
      expect(control.classList.contains('text-[var(--site-ink)]')).toBe(true);
      expect(control.classList.contains('bg-background')).toBe(false);
      expect(control.classList.contains('text-foreground')).toBe(false);
    }
  });

  it('keeps validation errors associated with their controls', () => {
    render(
      <FormField
        error="Enter your name"
        htmlFor="required-name"
        label="Name"
        required
      >
        <Input id="required-name" required />
      </FormField>
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    const error = screen.getByRole('alert');

    expect((input as HTMLInputElement).required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.textContent).toBe('Enter your name');
  });
});
