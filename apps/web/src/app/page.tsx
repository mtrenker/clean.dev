import React from 'react';
import { NextPage } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Marquee, SocialIcon } from '@/components/ui';
import { ScrollReveal } from '@/components/scroll-reveal';
import { getLocale, loadMessages } from '@/lib/locale';
import { getSocialProfiles } from '@/lib/social-profiles';
import { Link } from '@/components/ui/link';

const SPOTLIGHT_COMPANIES = [
  'Oetker Digital',
  'Fielmann AG',
  'Interhyp AG',
  'ProSiebenSat.1',
  'Lufthansa AG',
  'BMW Group',
  'McKinsey & Company',
  'Siemens AG',
  'UXMA GmbH',
  'Brückner Group',
];

const Page: NextPage = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const socialLinks = getSocialProfiles(intl);

  return (
    <ScrollReveal>
      <main id="main-content" className="min-h-screen bg-background text-foreground">

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <Section noBorder className="relative grid min-h-[90vh] grid-cols-12 gap-8">
          {/* Decorative column guides */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-12 gap-8 px-6 opacity-5 md:px-12 lg:px-24">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-l border-foreground" />
            ))}
          </div>

          {/* Main copy */}
          <div className="col-span-12 flex flex-col justify-center lg:col-span-8">
            <div className="observe">
              <p className="text-label mb-4 tracking-[0.3em] text-accent">
                {intl.formatMessage({ id: 'home.hero.label' })}
              </p>
              <Heading as="h1" variant="display" className="mb-8 text-6xl md:text-7xl lg:text-8xl">
                {intl.formatMessage({ id: 'home.hero.h1.part1' })}
                <span className="block text-accent">{intl.formatMessage({ id: 'home.hero.h1.part2' })}</span>
                <span className="block">{intl.formatMessage({ id: 'home.hero.h1.part3' })}</span>
              </Heading>
              <p className="mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
                {intl.formatMessage({ id: 'home.hero.lead' })}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/work" className="btn-primary group relative overflow-hidden">
                  <span className="relative z-10">{intl.formatMessage({ id: 'home.hero.cta.portfolio' })}</span>
                  <div className="absolute inset-0 -translate-x-full bg-accent transition-transform group-hover:translate-x-0" />
                </Link>
                <Link href="/contact" className="btn-secondary">
                  {intl.formatMessage({ id: 'home.hero.cta.contact' })}
                </Link>
              </div>
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="observe col-span-12 flex flex-col justify-center gap-12 delay-300 lg:col-span-4">
            <div className="border-l-2 border-accent pl-6">
              <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.years.value' })}</div>
              <div className="text-label text-muted-foreground">{intl.formatMessage({ id: 'home.stats.years.label' })}</div>
            </div>
            <div className="border-l-2 border-foreground pl-6">
              <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.engagements.value' })}</div>
              <div className="text-label text-muted-foreground">{intl.formatMessage({ id: 'home.stats.engagements.label' })}</div>
            </div>
            <div className="border-l-2 border-foreground pl-6">
              <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.companies.value' })}</div>
              <div className="text-label text-muted-foreground">{intl.formatMessage({ id: 'home.stats.companies.label' })}</div>
            </div>
          </div>

          {/* Scroll cue — decorative only */}
          <div aria-hidden="true" className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="h-12 w-0.5 bg-foreground" />
          </div>
        </Section>

        {/* ── Services / Expertise ────────────────────────────────────────────── */}
        <Section variant="inverted">
          <Container>
            <Heading as="h2" variant="section" animate className="mb-16">
              {intl.formatMessage({ id: 'home.expertise.heading' })}
            </Heading>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {(['1', '2', '3'] as const).map((num, index) => (
                <div
                  key={num}
                  className="observe group relative border-l-2 border-accent pl-6"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 font-mono text-3xl font-bold text-accent">
                    {num.padStart(2, '0')}
                  </div>
                  <h3 className="mb-3 font-serif text-2xl font-bold">
                    {intl.formatMessage({ id: `home.expertise.${num}.title` })}
                  </h3>
                  <p className="leading-relaxed opacity-70">
                    {intl.formatMessage({ id: `home.expertise.${num}.description` })}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── Trusted By ──────────────────────────────────────────────────────── */}
        <section className="overflow-hidden border-t-[length:var(--border-width)] border-t-border py-14">
          <p className="text-label mb-8 text-center tracking-[0.3em] text-muted-foreground/60">
            {intl.formatMessage({ id: 'home.trustedBy.label' })}
          </p>
          <Marquee items={SPOTLIGHT_COMPANIES} speed="slow" />
        </section>

        {/* ── Philosophy ──────────────────────────────────────────────────────── */}
        <Section>
          <Container className="grid gap-12 lg:grid-cols-2">
            <div className="observe">
              <Heading as="h2" variant="section" className="mb-6">
                {intl.formatMessage({ id: 'home.philosophy.heading' })}
              </Heading>
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>{intl.formatMessage({ id: 'home.philosophy.p1' })}</p>
                <p>{intl.formatMessage({ id: 'home.philosophy.p2' })}</p>
                <p>{intl.formatMessage({ id: 'home.philosophy.p3' })}</p>
              </div>
            </div>

            <div className="observe delay-300 flex flex-col justify-center space-y-8">
              <blockquote className="border-l-4 border-accent bg-muted p-8">
                <p className="mb-4 font-serif text-2xl leading-relaxed">
                  {intl.formatMessage({ id: 'home.philosophy.quote' })}
                </p>
              </blockquote>
            </div>
          </Container>
        </Section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <Section variant="accent">
          <div className="mx-auto max-w-4xl text-center">
            <Heading as="h2" variant="section" animate className="mb-6 lg:text-6xl">
              {intl.formatMessage({ id: 'home.cta.heading' })}
            </Heading>
            <p className="observe delay-200 mb-12 text-xl leading-relaxed md:text-2xl">
              {intl.formatMessage({ id: 'home.cta.lead' })}
            </p>
            <div className="observe delay-[400ms] flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="btn bg-foreground text-background transition-all hover:bg-foreground/90"
              >
                {intl.formatMessage({ id: 'home.cta.contact' })}
              </Link>
              <Link
                href="/work"
                className="btn border-foreground text-foreground transition-all hover:bg-foreground hover:text-accent"
                style={{ borderWidth: 'var(--border-width)' }}
              >
                {intl.formatMessage({ id: 'home.cta.portfolio' })}
              </Link>
            </div>
          </div>
        </Section>

        {/* ── Profile links / social ───────────────────────────────────────── */}
        <Section>
          <Container className="text-center">
            <p className="text-label mb-3 tracking-[0.25em] text-accent">
              {intl.formatMessage({ id: 'home.profile.heading' })}
            </p>
            <div className="mb-8 text-sm leading-relaxed text-muted-foreground">
              {intl.formatMessage({ id: 'home.profile.lead' })}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((profile) => (
                <Link
                  key={profile.href}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
                  external
                  href={profile.href}
                  ariaLabel={profile.ariaLabel}
                >
                  <span className="sr-only">{profile.label}</span>
                  <SocialIcon profile={profile.key} className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </Container>
        </Section>

      </main>
    </ScrollReveal>
  );
};

export default Page;
