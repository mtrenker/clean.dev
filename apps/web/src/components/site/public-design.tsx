import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Link } from '@/components/ui/link';

export const publicSurface = 'min-h-screen bg-[#14130f] text-[#ede7d4]';

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
  <section className={clsx('py-12 md:py-16', border && 'border-b border-[#2c2924]', className)}>
    {children}
  </section>
);

export const Eyebrow = ({ children, tone = 'rust' }: { children: ReactNode; tone?: 'rust' | 'green' | 'amber' | 'muted' }) => (
  <span
    className={clsx(
      'inline-flex rounded-[2px] border px-3 py-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]',
      tone === 'rust' && 'border-[#8b3f24] text-[#d96e3f]',
      tone === 'green' && 'border-[#7eaf6a]/70 text-[#7eaf6a]',
      tone === 'amber' && 'border-[#d0a04a]/70 text-[#d0a04a]',
      tone === 'muted' && 'border-[#5a564b]/60 text-[#8a8474]',
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
          <h1 className="mt-7 max-w-5xl text-[clamp(3.2rem,8vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[#ede7d4]">
            {title}
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-8 text-[#c4bda9] md:text-2xl md:leading-9">
            {lead}
          </p>
        </div>
        {aside ? <aside className="space-y-4">{aside}</aside> : null}
      </div>
    </SiteContainer>
  </SiteSection>
);

export const SectionHeader = ({ title, meta }: { title: ReactNode; meta?: ReactNode }) => (
  <div className="mb-8 flex items-end justify-between gap-6 border-b border-[#ede7d4] pb-4 md:mb-10">
    <h2 className="max-w-4xl text-3xl font-medium leading-none tracking-[-0.035em] text-[#ede7d4] md:text-5xl">
      {title}
    </h2>
    {meta ? (
      <p className="hidden shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8474] md:block">
        {meta}
      </p>
    ) : null}
  </div>
);

export const Card = ({ children, className, as: Component = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'section' }) => (
  <Component className={clsx('rounded-[6px] border border-[#2c2924] bg-[#1c1a16]', className)}>
    {children}
  </Component>
);

export const Tag = ({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'rust' | 'green' | 'amber' }) => (
  <span
    className={clsx(
      'inline-flex rounded-[2px] border px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em]',
      tone === 'muted' && 'border-[#5a564b]/60 text-[#8a8474]',
      tone === 'rust' && 'border-[#8b3f24] text-[#d96e3f]',
      tone === 'green' && 'border-[#7eaf6a]/70 text-[#7eaf6a]',
      tone === 'amber' && 'border-[#d0a04a]/70 text-[#d0a04a]',
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
      variant === 'primary' && 'bg-[#d96e3f] text-[#14130f] hover:bg-[#ede7d4]',
      variant === 'secondary' && 'border border-[#2c2924] text-[#ede7d4] hover:border-[#d96e3f] hover:text-[#d96e3f]',
      className,
    )}
  >
    {children}
  </Link>
);

export const StatStrip = ({ stats }: { stats: Array<{ value: ReactNode; label: ReactNode }> }) => (
  <section className="grid border-b border-[#2c2924] md:grid-cols-4">
    {stats.map((stat) => (
      <div key={String(stat.label)} className="border-b border-r border-[#2c2924] px-5 py-7 md:border-b-0 md:px-8">
        <p className="text-5xl font-medium tracking-[-0.04em] text-[#ede7d4]">{stat.value}</p>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[#8a8474]">{stat.label}</p>
      </div>
    ))}
  </section>
);

export const DefinitionList = ({ items }: { items: Array<{ label: ReactNode; value: ReactNode }> }) => (
  <dl className="grid gap-3 font-mono text-xs">
    {items.map((item) => (
      <div key={String(item.label)}>
        <dt className="uppercase tracking-[0.18em] text-[#8a8474]">{item.label}</dt>
        <dd className="mt-1 text-[#ede7d4]">{item.value}</dd>
      </div>
    ))}
  </dl>
);

export const LegalCard = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <Card as="section" className="p-6 md:p-8">
    <h2 className="text-2xl font-medium tracking-[-0.02em] text-[#ede7d4]">{title}</h2>
    <div className="mt-4 leading-7 text-[#c4bda9] [&_a]:text-[#d96e3f] [&_a:hover]:underline [&_strong]:text-[#ede7d4]">
      {children}
    </div>
  </Card>
);
