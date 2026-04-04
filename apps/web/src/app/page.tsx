'use client';

import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { Marquee } from "@/components/ui";

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

const Page: NextPage = () => {
  const intl = useIntl();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.observe');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="section relative grid min-h-[85vh] grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      >
        {/* Decorative Grid Lines — desktop only */}
        <div className="pointer-events-none absolute inset-0 hidden grid-cols-12 gap-8 px-6 opacity-[0.03] md:px-12 lg:grid lg:px-24" aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-l border-foreground" />
          ))}
        </div>

        {/* Main Content */}
        <div className="col-span-1 flex flex-col justify-center lg:col-span-8">
          <div className="observe">
            <p className="text-label mb-4 tracking-[0.3em] text-accent">
              {intl.formatMessage({ id: 'home.hero.label' })}
            </p>
            <h1 className="heading-display mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              {intl.formatMessage({ id: 'home.hero.h1.part1' })}
              <span className="block text-accent">{intl.formatMessage({ id: 'home.hero.h1.part2' })}</span>
              <span className="block">{intl.formatMessage({ id: 'home.hero.h1.part3' })}</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              {intl.formatMessage({ id: 'home.hero.lead' })}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/work"
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10">{intl.formatMessage({ id: 'home.hero.cta.portfolio' })}</span>
                <div className="absolute inset-0 -translate-x-full bg-accent transition-transform group-hover:translate-x-0" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary"
              >
                {intl.formatMessage({ id: 'home.hero.cta.contact' })}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div
          ref={statsRef}
          className="observe col-span-1 flex flex-row flex-wrap gap-8 delay-300 sm:gap-12 lg:col-span-4 lg:flex-col lg:justify-center lg:gap-12"
        >
          <div className="border-l-2 border-accent pl-5 sm:pl-6">
            <div className="mb-1 font-serif text-4xl font-extrabold sm:text-5xl">{intl.formatMessage({ id: 'home.stats.years.value' })}</div>
            <div className="text-label text-xs text-muted-foreground sm:text-sm">
              {intl.formatMessage({ id: 'home.stats.years.label' })}
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-5 sm:pl-6">
            <div className="mb-1 font-serif text-4xl font-extrabold sm:text-5xl">{intl.formatMessage({ id: 'home.stats.engagements.value' })}</div>
            <div className="text-label text-xs text-muted-foreground sm:text-sm">
              {intl.formatMessage({ id: 'home.stats.engagements.label' })}
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-5 sm:pl-6">
            <div className="mb-1 font-serif text-4xl font-extrabold sm:text-5xl">{intl.formatMessage({ id: 'home.stats.companies.value' })}</div>
            <div className="text-label text-xs text-muted-foreground sm:text-sm">
              {intl.formatMessage({ id: 'home.stats.companies.label' })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator — hide on small screens */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce lg:block" aria-hidden="true">
          <div className="h-10 w-0.5 bg-foreground/30" />
        </div>
      </section>

      {/* Expertise Section */}
      <section className="section section-border bg-foreground text-background">
        <div className="container-custom">
          <h2 className="heading-section observe mb-12 sm:mb-16">
            {intl.formatMessage({ id: 'home.expertise.heading' })}
          </h2>

          <div className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-3">
            {(['1','2','3'] as const).map((num, index) => {
              const item = {
                title: intl.formatMessage({ id: `home.expertise.${num}.title` }),
                description: intl.formatMessage({ id: `home.expertise.${num}.description` }),
                icon: num.padStart(2, '0'),
              };
              return (
              <div
                key={item.icon}
                className="observe group relative border-l-2 border-accent pl-5 sm:pl-6"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-3 font-mono text-2xl font-bold text-accent sm:text-3xl">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold sm:text-2xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed opacity-70 sm:text-base">
                  {item.description}
                </p>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="overflow-hidden border-t-[length:var(--border-width)] border-t-border py-10 sm:py-14">
        <p className="text-label mb-6 text-center tracking-[0.3em] text-muted-foreground/60 sm:mb-8">
          {intl.formatMessage({ id: 'home.trustedBy.label' })}
        </p>
        <Marquee items={SPOTLIGHT_COMPANIES} speed="slow" />
      </section>

      {/* Philosophy Section */}
      <section className="section section-border">
        <div className="container-custom grid gap-10 sm:gap-12 lg:grid-cols-2">
          <div className="observe">
            <h2 className="heading-section mb-6">
              {intl.formatMessage({ id: 'home.philosophy.heading' })}
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                {intl.formatMessage({ id: 'home.philosophy.p1' })}
              </p>
              <p>
                {intl.formatMessage({ id: 'home.philosophy.p2' })}
              </p>
              <p>
                {intl.formatMessage({ id: 'home.philosophy.p3' })}
              </p>
            </div>
          </div>

          <div className="observe delay-300 flex flex-col justify-center space-y-8">
            <blockquote className="border-l-4 border-accent bg-muted p-6 sm:p-8">
              <p className="font-serif text-xl leading-relaxed sm:text-2xl">
                {intl.formatMessage({ id: 'home.philosophy.quote' })}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-border bg-accent text-accent-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="heading-section observe mb-6 text-3xl sm:text-4xl lg:text-6xl">
            {intl.formatMessage({ id: 'home.cta.heading' })}
          </h2>
          <p className="observe delay-200 mb-10 text-lg leading-relaxed sm:text-xl md:text-2xl">
            {intl.formatMessage({ id: 'home.cta.lead' })}
          </p>
          <div className="observe delay-[400ms] flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
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
      </section>
    </main>
  );
}

export default Page;
