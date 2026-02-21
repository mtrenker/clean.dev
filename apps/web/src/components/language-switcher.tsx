'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/lib/locale-actions';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/locale';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLocale }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (locale: Locale) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-border px-1 py-0.5 text-xs"
      aria-label="Language switcher"
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          disabled={isPending}
          onClick={() => handleSwitch(locale)}
          className={[
            'rounded px-1.5 py-0.5 font-mono font-semibold uppercase tracking-wider transition-colors',
            locale === currentLocale
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {locale}
        </button>
      ))}
    </div>
  );
};
