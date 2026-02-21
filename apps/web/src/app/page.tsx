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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="section relative grid min-h-[90vh] grid-cols-12 gap-8"
      >
        {/* Decorative Grid Lines */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-12 gap-8 px-6 opacity-5 md:px-12 lg:px-24">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-l border-foreground" />
          ))}
        </div>

        {/* Main Content */}
        <div className="col-span-12 flex flex-col justify-center lg:col-span-8">
          <div className="observe">
            <p className="text-label mb-4 tracking-[0.3em] text-accent">
              {intl.formatMessage({ id: 'home.hero.label' })}
            </p>
            <h1 className="heading-display mb-8 text-6xl md:text-7xl lg:text-8xl">
              {intl.formatMessage({ id: 'home.hero.h1.part1' })}
              <span className="block text-accent">{intl.formatMessage({ id: 'home.hero.h1.part2' })}</span>
              <span className="block">{intl.formatMessage({ id: 'home.hero.h1.part3' })}</span>
            </h1>
            <p className="mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {intl.formatMessage({ id: 'home.hero.lead' })}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/me"
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
          className="observe col-span-12 flex flex-col justify-center gap-12 delay-300 lg:col-span-4"
        >
          <div className="border-l-2 border-accent pl-6">
            <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.years.value' })}</div>
            <div className="text-label text-muted-foreground">
              {intl.formatMessage({ id: 'home.stats.years.label' })}
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-6">
            <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.quality.value' })}</div>
            <div className="text-label text-muted-foreground">
              {intl.formatMessage({ id: 'home.stats.quality.label' })}
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-6">
            <div className="mb-2 font-serif text-5xl font-bold">{intl.formatMessage({ id: 'home.stats.learning.value' })}</div>
            <div className="text-label text-muted-foreground">
              {intl.formatMessage({ id: 'home.stats.learning.label' })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-12 w-0.5 bg-foreground" />
        </div>
      </section>

      {/* Expertise Section */}
      <section className="section section-border bg-foreground text-background">
        <div className="container-custom">
          <h2 className="heading-section observe mb-16">
            {intl.formatMessage({ id: 'home.expertise.heading' })}
          </h2>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {(['1','2','3','4','5','6'] as const).map((num, index) => {
              const item = {
                title: intl.formatMessage({ id: `home.expertise.${num}.title` }),
                description: intl.formatMessage({ id: `home.expertise.${num}.description` }),
                icon: num.padStart(2, '0'),
              };
              return (
              <div
                key={item.icon}
                className="observe group relative border-l-2 border-accent pl-6"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 font-mono text-3xl font-bold text-accent">
                  {item.icon}
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold">
                  {item.title}
                </h3>
                <p className="leading-relaxed opacity-70">
                  {item.description}
                </p>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="overflow-hidden border-t-[length:var(--border-width)] border-t-border py-14">
        <p className="text-label mb-8 text-center tracking-[0.3em] text-muted-foreground/60">
          {intl.formatMessage({ id: 'home.trustedBy.label' })}
        </p>
        <Marquee items={SPOTLIGHT_COMPANIES} speed="slow" />
      </section>

      {/* Philosophy Section */}
      <section className="section section-border">
        <div className="container-custom grid gap-12 lg:grid-cols-2">
          <div className="observe">
            <h2 className="heading-section mb-6">
              {intl.formatMessage({ id: 'home.philosophy.heading' })}
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
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
            <blockquote className="border-l-4 border-accent bg-muted p-8">
              <p className="mb-4 font-serif text-2xl leading-relaxed">
                {intl.formatMessage({ id: 'home.philosophy.quote' })}
              </p>
              <cite className="text-label text-muted-foreground">
                {intl.formatMessage({ id: 'home.philosophy.quote.author' })}
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-border bg-accent text-accent-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="heading-section observe mb-6 lg:text-6xl">
            {intl.formatMessage({ id: 'home.cta.heading' })}
          </h2>
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
              href="/me"
              className="btn border-foreground text-foreground transition-all hover:bg-foreground hover:text-accent"
              style={{ borderWidth: 'var(--border-width)' }}
            >
              {intl.formatMessage({ id: 'home.cta.portfolio' })}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
