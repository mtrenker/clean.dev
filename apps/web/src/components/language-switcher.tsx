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
      className="flex items-center gap-1 rounded-full border border-[#2c2924] bg-[#1c1a16]/90 p-1 text-xs shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
      aria-label="Language switcher"
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          disabled={isPending}
          onClick={() => handleSwitch(locale)}
          className={[
            'inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] transition-colors',
            locale === currentLocale
              ? 'bg-[#d96e3f] !text-[#14130f] shadow-[0_0_0_1px_rgba(217,110,63,0.34)]'
              : 'text-[#c4bda9] hover:bg-[#2c2924] hover:text-[#ede7d4]',
          ].join(' ')}
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {locale}
        </button>
      ))}
    </div>
  );
};
