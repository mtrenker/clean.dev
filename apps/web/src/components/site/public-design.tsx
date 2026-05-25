import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Link } from '@/components/ui/link';

export const publicSurface = 'min-h-screen bg-[var(--site-bg)] text-[var(--site-ink)]';

export const SiteShell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <main id="main-content" className={clsx(publicSurface, className)}>
    {children}
  </main>
);

export const SiteContainer = ({ children, className, narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) => (
  <div className={clsx('mx-auto w-full px-5 md:px-14', narrow ? 'max-w-[62rem]' : 'max-w-[90rem]', className)}>
    {children}
  </div>
);

export const SiteSection = ({ children, className, border = true }: { children: ReactNode; className?: string; border?: boolean }) => (
  <section className={clsx('py-12 md:py-16', border && 'border-b border-[var(--site-rule)]', className)}>
    {children}
  </section>
);

export const Eyebrow = ({ children, tone = 'rust' }: { children: ReactNode; tone?: 'rust' | 'green' | 'amber' | 'muted' }) => (
  <span
    className={clsx(
      'inline-flex rounded-[2px] border px-3 py-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]',
      tone === 'rust' && 'border-[var(--site-rust-soft)] text-[var(--site-rust)]',
      tone === 'green' && 'border-[var(--site-green)] text-[var(--site-green)]',
      tone === 'amber' && 'border-[var(--site-amber)] text-[var(--site-amber)]',
      tone === 'muted' && 'border-[var(--site-ink-faint)] text-[var(--site-ink-mute)]',
    )}
  >
    {children}
  </span>
);

export const PageHero = ({ eyebrow, title, lead, aside }: { eyebrow: ReactNode; title: ReactNode; lead: ReactNode; aside?: ReactNode }) => (
  <SiteSection className="py-12 md:py-20">
    <SiteContainer>
      <div className={clsx('grid gap-12', Boolean(aside) && 'lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16')}>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-7 max-w-5xl text-[clamp(3.2rem,8vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[var(--site-ink)]">
            {title}
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-8 text-[var(--site-ink-sec)] md:text-2xl md:leading-9">
            {lead}
          </p>
        </div>
        {aside ? <aside className="space-y-4">{aside}</aside> : null}
      </div>
    </SiteContainer>
  </SiteSection>
);

export const SectionHeader = ({ title, meta }: { title: ReactNode; meta?: ReactNode }) => (
  <div className="mb-8 flex items-end justify-between gap-6 border-b border-[var(--site-ink)] pb-4 md:mb-10">
    <h2 className="max-w-4xl text-3xl font-medium leading-none tracking-[-0.035em] text-[var(--site-ink)] md:text-5xl">
      {title}
    </h2>
    {meta ? (
      <p className="hidden shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--site-ink-mute)] md:block">
        {meta}
      </p>
    ) : null}
  </div>
);

export const Card = ({ children, className, as: Component = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'section' }) => (
  <Component className={clsx('rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)]', className)}>
    {children}
  </Component>
);

export const Tag = ({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'rust' | 'green' | 'amber' }) => (
  <span
    className={clsx(
      'inline-flex rounded-[2px] border px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em]',
      tone === 'muted' && 'border-[var(--site-ink-faint)] text-[var(--site-ink-mute)]',
      tone === 'rust' && 'border-[var(--site-rust-soft)] text-[var(--site-rust)]',
      tone === 'green' && 'border-[var(--site-green)] text-[var(--site-green)]',
      tone === 'amber' && 'border-[var(--site-amber)] text-[var(--site-amber)]',
    )}
  >
    {children}
  </span>
);

export const ButtonLink = ({ href, children, variant = 'primary', className }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary'; className?: string }) => (
  <Link
    href={href}
    className={clsx(
      'inline-flex items-center justify-center rounded-[3px] px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] transition',
      variant === 'primary' && 'bg-[var(--site-rust)] text-[var(--site-bg)] hover:bg-[var(--site-ink)]',
      variant === 'secondary' && 'border border-[var(--site-rule)] text-[var(--site-ink)] hover:border-[var(--site-rust)] hover:text-[var(--site-rust)]',
      className,
    )}
  >
    {children}
  </Link>
);

export const StatStrip = ({ stats }: { stats: Array<{ value: ReactNode; label: ReactNode }> }) => (
  <section className="grid border-b border-[var(--site-rule)] md:grid-cols-4">
    {stats.map((stat) => (
      <div key={String(stat.label)} className="border-b border-r border-[var(--site-rule)] px-5 py-7 md:border-b-0 md:px-8">
        <p className="text-5xl font-medium tracking-[-0.04em] text-[var(--site-ink)]">{stat.value}</p>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{stat.label}</p>
      </div>
    ))}
  </section>
);

export const DefinitionList = ({ items }: { items: Array<{ label: ReactNode; value: ReactNode }> }) => (
  <dl className="grid gap-3 font-mono text-xs">
    {items.map((item) => (
      <div key={String(item.label)}>
        <dt className="uppercase tracking-[0.18em] text-[var(--site-ink-mute)]">{item.label}</dt>
        <dd className="mt-1 text-[var(--site-ink)]">{item.value}</dd>
      </div>
    ))}
  </dl>
);

export const LegalCard = ({ title, children, meta }: { title: ReactNode; children: ReactNode; meta?: ReactNode }) => (
  <Card as="section" className="overflow-hidden">
    <div className={clsx(Boolean(meta) && 'md:grid md:grid-cols-[7rem_1fr]')}>
      {meta ? (
        <div className="border-b border-[var(--site-rule)] bg-[var(--site-panel-deep)] px-6 py-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--site-rust)] md:border-b-0 md:border-r">
          {meta}
        </div>
      ) : null}
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{title}</h2>
        <div className="mt-4 leading-7 text-[var(--site-ink-sec)] [&_a]:text-[var(--site-rust)] [&_a:hover]:underline [&_strong]:text-[var(--site-ink)]">
          {children}
        </div>
      </div>
    </div>
  </Card>
);
