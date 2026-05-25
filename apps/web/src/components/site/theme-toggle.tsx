'use client';

import { useEffect, useState } from 'react';

type SiteTheme = 'dark' | 'light';
type ThemePreference = 'system' | SiteTheme;

const STORAGE_KEY = 'clean.dev.site-theme';
const QUERY = '(prefers-color-scheme: light)';

const systemTheme = (): SiteTheme => (
  window.matchMedia(QUERY).matches ? 'light' : 'dark'
);

const resolveTheme = (preference: ThemePreference): SiteTheme => (
  preference === 'system' ? systemTheme() : preference
);

const applyTheme = (preference: ThemePreference) => {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.siteTheme = resolved;
  document.documentElement.dataset.siteThemePreference = preference;
  return resolved;
};

const readPreference = (): ThemePreference => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

export const ThemeToggle = () => {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<SiteTheme>('dark');

  useEffect(() => {
    const initialPreference = readPreference();
    setPreference(initialPreference);
    setTheme(applyTheme(initialPreference));

    const media = window.matchMedia(QUERY);
    const handleChange = () => {
      setPreference((current) => {
        if (current === 'system') setTheme(applyTheme('system'));
        return current;
      });
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const nextPreference: ThemePreference = preference === 'system'
    ? 'light'
    : preference === 'light'
      ? 'dark'
      : 'system';

  const label = preference === 'system' ? `system · ${theme}` : preference;

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--site-rule)] bg-[var(--site-panel)] px-3 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--site-ink-sec)] shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition hover:bg-[var(--site-rule)] hover:text-[var(--site-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-bg)]"
      onClick={() => {
        setPreference(nextPreference);
        setTheme(applyTheme(nextPreference));
        if (nextPreference === 'system') {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          window.localStorage.setItem(STORAGE_KEY, nextPreference);
        }
      }}
      aria-label={`Theme: ${label}. Switch to ${nextPreference} mode`}
      title={`Theme: ${label}. Switch to ${nextPreference} mode`}
    >
      <span aria-hidden="true" className="text-sm leading-none">{preference === 'system' ? '◐' : theme === 'dark' ? '☀' : '☾'}</span>
      <span className="hidden sm:inline">{preference === 'system' ? 'system' : preference === 'dark' ? 'light' : 'dark'}</span>
    </button>
  );
};
