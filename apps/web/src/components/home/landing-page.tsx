import React from 'react';
import type { IntlShape } from 'react-intl';
import { Container, Marquee, SocialIcon } from '@/components/ui';
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

type SocialLink = {
  key: 'xing' | 'linkedin' | 'github';
  href: string;
  label: string;
  ariaLabel: string;
};

interface LandingPageProps {
  intl: IntlShape;
  socialLinks: SocialLink[];
}

const msg = (intl: IntlShape, id: string) => intl.formatMessage({ id });

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-sm text-accent">$ {children}</span>
);

const TerminalPanel = ({ intl }: { intl: IntlShape }) => {
  const lines = ['01', '02', '03'] as const;

  return (
    <div className="terminal-card observe delay-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-destructive" />
          <span className="h-3 w-3 rounded-full bg-warning" />
          <span className="h-3 w-3 rounded-full bg-success" />
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
          clean.dev/diagnose
        </span>
      </div>
      <div className="space-y-5 p-5 md:p-6">
        <div>
          <Prompt>run embedded-delivery --with-ai --no-theater</Prompt>
          <p className="mt-3 font-mono text-sm leading-6 text-muted-foreground">
            {msg(intl, 'home.terminal.output')}
          </p>
        </div>
        <div className="grid gap-3">
          {lines.map((line) => (
            <div key={line} className="rounded-lg border border-border/70 bg-background/55 p-4 shadow-inner">
              <div className="mb-2 flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.18em]">
                <span className="text-accent">signal/{line}</span>
                <span className="text-muted-foreground">ok</span>
              </div>
              <p className="text-sm leading-6 text-foreground/90">
                {msg(intl, `home.terminal.${line}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricStrip = ({ intl }: { intl: IntlShape }) => {
  const metrics = ['years', 'engagements', 'companies'] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric, index) => (
        <div
          key={metric}
          className="observe terminal-card p-5"
          style={{ transitionDelay: `${index * 100 + 150}ms` }}
        >
          <div className="font-mono text-3xl font-semibold text-accent">
            {msg(intl, `home.stats.${metric}.value`)}
          </div>
          <div className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {msg(intl, `home.stats.${metric}.label`)}
          </div>
        </div>
      ))}
    </div>
  );
};

const Hero = ({ intl }: { intl: IntlShape }) => (
  <section className="relative overflow-hidden px-6 py-20 md:px-12 md:py-28 lg:px-24 lg:py-32">
    <div className="tech-grid" aria-hidden="true" />
    <Container size="wide" className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <div>
        <p className="observe text-label mb-5 text-accent">
          {msg(intl, 'home.hero.label')}
        </p>
        <h1 className="observe max-w-5xl font-serif text-5xl font-black leading-[0.94] tracking-[-0.06em] text-foreground md:text-7xl lg:text-8xl">
          {msg(intl, 'home.hero.h1.part1')}{' '}
          <span className="text-gradient">{msg(intl, 'home.hero.h1.part2')}</span>{' '}
          {msg(intl, 'home.hero.h1.part3')}
        </h1>
        <p className="observe delay-100 mt-8 max-w-3xl text-xl leading-8 text-muted-foreground md:text-2xl md:leading-9">
          {msg(intl, 'home.hero.lead')}
        </p>
        <div className="observe delay-200 mt-10 flex flex-wrap gap-4">
          <Link href="/contact" className="btn-primary">
            {msg(intl, 'home.hero.cta.contact')}
          </Link>
          <Link href="/work" className="btn-secondary">
            {msg(intl, 'home.hero.cta.portfolio')}
          </Link>
        </div>
      </div>
      <TerminalPanel intl={intl} />
    </Container>
  </section>
);

const OperatingModel = ({ intl }: { intl: IntlShape }) => {
  const levers = ['1', '2', '3'] as const;

  return (
    <section className="section section-border relative overflow-hidden bg-background text-foreground">
      <Container>
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <Prompt>{msg(intl, 'home.expertise.prompt')}</Prompt>
            <h2 className="mt-4 font-serif text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
              {msg(intl, 'home.expertise.heading')}
            </h2>
          </div>
          <p className="text-lg leading-8 text-muted-foreground">
            {msg(intl, 'home.expertise.lead')}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {levers.map((num, index) => (
            <article
              key={num}
              className="observe terminal-card group p-6"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-sm text-accent">0{num}</span>
                <span className="h-px flex-1 bg-border/60 ml-4 transition-colors group-hover:bg-accent" />
              </div>
              <h3 className="mb-4 font-serif text-2xl font-bold tracking-[-0.02em]">
                {msg(intl, `home.expertise.${num}.title`)}
              </h3>
              <p className="leading-7 text-muted-foreground">
                {msg(intl, `home.expertise.${num}.description`)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};

const Proof = ({ intl }: { intl: IntlShape }) => (
  <section className="section section-border bg-muted/30 text-foreground">
    <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="observe">
        <Prompt>{msg(intl, 'home.proof.prompt')}</Prompt>
        <h2 className="mt-4 font-serif text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
          {msg(intl, 'home.proof.heading')}
        </h2>
      </div>
      <div className="space-y-5">
        <MetricStrip intl={intl} />
        <div className="observe terminal-card p-6">
          <p className="mb-5 font-mono text-sm text-accent">{msg(intl, 'home.proof.case.label')}</p>
          <p className="text-xl leading-8 text-foreground">
            {msg(intl, 'home.proof.case.body')}
          </p>
        </div>
      </div>
    </Container>
  </section>
);

const TrustedBy = ({ intl }: { intl: IntlShape }) => (
  <section className="overflow-hidden border-t border-border bg-background py-12">
    <p className="text-label mb-8 text-center text-muted-foreground/80">
      {msg(intl, 'home.trustedBy.label')}
    </p>
    <Marquee items={SPOTLIGHT_COMPANIES} speed="slow" />
  </section>
);

const Philosophy = ({ intl }: { intl: IntlShape }) => (
  <section className="section section-border bg-background text-foreground">
    <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="observe">
        <Prompt>{msg(intl, 'home.philosophy.prompt')}</Prompt>
        <h2 className="mt-4 font-serif text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
          {msg(intl, 'home.philosophy.heading')}
        </h2>
      </div>
      <div className="observe delay-100 space-y-6 text-lg leading-8 text-muted-foreground">
        <p>{msg(intl, 'home.philosophy.p1')}</p>
        <p>{msg(intl, 'home.philosophy.p2')}</p>
        <blockquote className="terminal-card border-accent/80 p-6 text-foreground">
          <p className="font-serif text-2xl font-bold leading-8 tracking-[-0.02em]">
            “{msg(intl, 'home.philosophy.quote')}”
          </p>
        </blockquote>
      </div>
    </Container>
  </section>
);

const Cta = ({ intl }: { intl: IntlShape }) => (
  <section className="section section-border relative overflow-hidden bg-foreground text-background">
    <div className="tech-grid opacity-20" aria-hidden="true" />
    <Container className="relative text-center">
      <Prompt>{msg(intl, 'home.cta.prompt')}</Prompt>
      <h2 className="observe mx-auto mt-4 max-w-4xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
        {msg(intl, 'home.cta.heading')}
      </h2>
      <p className="observe delay-100 mx-auto mt-6 max-w-3xl text-xl leading-8 text-background/75">
        {msg(intl, 'home.cta.lead')}
      </p>
      <div className="observe delay-200 mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/contact" className="btn bg-accent text-accent-foreground hover:bg-background hover:text-foreground">
          {msg(intl, 'home.cta.contact')}
        </Link>
        <Link href="/work" className="btn border border-background/40 text-background hover:border-accent hover:text-accent">
          {msg(intl, 'home.cta.portfolio')}
        </Link>
      </div>
    </Container>
  </section>
);

const ProfileLinks = ({ intl, socialLinks }: LandingPageProps) => (
  <section className="section section-border bg-background text-foreground">
    <Container className="text-center">
      <p className="text-label mb-3 text-accent">{msg(intl, 'home.profile.heading')}</p>
      <p className="mx-auto mb-8 max-w-xl text-muted-foreground">{msg(intl, 'home.profile.lead')}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((profile) => (
          <Link
            key={profile.href}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
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
  </section>
);

export const LandingPage = ({ intl, socialLinks }: LandingPageProps) => (
  <main id="main-content" className="min-h-screen bg-background text-foreground">
    <Hero intl={intl} />
    <OperatingModel intl={intl} />
    <Proof intl={intl} />
    <TrustedBy intl={intl} />
    <Philosophy intl={intl} />
    <Cta intl={intl} />
    <ProfileLinks intl={intl} socialLinks={socialLinks} />
  </main>
);
