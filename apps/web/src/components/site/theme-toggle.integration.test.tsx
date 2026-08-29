import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

const STORAGE_KEY = 'clean.dev.site-theme';

const mockSystemTheme = (theme: 'dark' | 'light') => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)' && theme === 'light',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSystemTheme('dark');
  });

  it('shows the active theme rather than the theme of the next action', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');
    render(<ThemeToggle />);

    const toggle = await screen.findByRole('button', {
      name: 'Theme: dark. Switch to system mode',
    });

    expect(toggle.textContent).toBe('☾dark');
  });

  it('keeps the visible state aligned while cycling through preferences', async () => {
    render(<ThemeToggle />);

    let toggle = await screen.findByRole('button', {
      name: 'Theme: system · dark. Switch to light mode',
    });
    expect(toggle.textContent).toBe('◐system');

    fireEvent.click(toggle);
    toggle = screen.getByRole('button', { name: 'Theme: light. Switch to dark mode' });
    expect(toggle.textContent).toBe('☀light');

    fireEvent.click(toggle);
    toggle = screen.getByRole('button', { name: 'Theme: dark. Switch to system mode' });
    expect(toggle.textContent).toBe('☾dark');

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: 'Theme: system · dark. Switch to light mode',
      }).textContent).toBe('◐system');
    });
  });
});
