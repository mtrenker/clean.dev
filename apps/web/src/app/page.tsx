'use client';

import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useRef } from "react";

const Page: NextPage = () => {
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
              Software Consultant
            </p>
            <h1 className="heading-display mb-8 text-6xl md:text-7xl lg:text-8xl">
              Building better software through
              <span className="block text-accent">clean code</span>
              <span className="block">& team velocity</span>
            </h1>
            <p className="mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              20 years of engineering excellence. Helping teams write maintainable
              code, embrace agile practices, and amplify productivity with the right
              blend of human expertise and AI tooling.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/me"
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10">View Portfolio</span>
                <div className="absolute inset-0 -translate-x-full bg-accent transition-transform group-hover:translate-x-0" />
              </Link>
              <Link
                href="/me"
                className="btn-secondary"
              >
                Contact
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
            <div className="mb-2 font-serif text-5xl font-bold">20+</div>
            <div className="text-label text-muted-foreground">
              Years of Experience
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-6">
            <div className="mb-2 font-serif text-5xl font-bold">100%</div>
            <div className="text-label text-muted-foreground">
              Focus on Quality
            </div>
          </div>
          <div className="border-l-2 border-foreground pl-6">
            <div className="mb-2 font-serif text-5xl font-bold">∞</div>
            <div className="text-label text-muted-foreground">
              Continuous Learning
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
            Expertise that drives results
          </h2>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Clean Architecture",
                description: "Building systems that are maintainable, scalable, and a joy to work with. Code that stands the test of time through proper design principles and patterns.",
                icon: "01"
              },
              {
                title: "Team Acceleration",
                description: "Unlocking team potential through authentic agile practices, transparent communication, and identifying bottlenecks with Theory of Constraints.",
                icon: "02"
              },
              {
                title: "AI Integration",
                description: "Leveraging AI tools strategically to amplify developer productivity without compromising code quality or team autonomy.",
                icon: "03"
              },
              {
                title: "TypeScript Excellence",
                description: "Deep expertise in modern TypeScript, serverless architectures, Web Components, REST, and GraphQL for robust full-stack solutions.",
                icon: "04"
              },
              {
                title: "Quality Systems",
                description: "Implementing quality management practices that catch issues early, reduce technical debt, and maintain high standards sustainably.",
                icon: "05"
              },
              {
                title: "Cloud Native",
                description: "Building and deploying scalable cloud solutions with modern DevOps practices, Kubernetes, and infrastructure as code.",
                icon: "06"
              }
            ].map((item, index) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section section-border">
        <div className="container-custom grid gap-12 lg:grid-cols-2">
          <div className="observe">
            <h2 className="heading-section mb-6">
              Philosophy
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Software development is a human endeavor. The best technical solutions
                emerge from teams that communicate transparently, share knowledge freely,
                and maintain a genuine agile mindset.
              </p>
              <p>
                After two decades in this field, I've learned that sustainable productivity
                comes from investing in quality upfront, not rushing to meet arbitrary deadlines.
                Clean code isn't a luxury—it's the foundation of every successful project.
              </p>
              <p>
                AI is transforming our industry, but it's a tool, not a replacement.
                The real value comes from experienced engineers who know when to leverage
                automation and when human judgment is irreplaceable.
              </p>
            </div>
          </div>

          <div className="observe delay-300 flex flex-col justify-center space-y-8">
            <blockquote className="border-l-4 border-accent bg-muted p-8">
              <p className="mb-4 font-serif text-2xl leading-relaxed">
                "Every project has its unique challenges. I love analyzing them from
                a cross-functional perspective to expand my horizon and pass knowledge
                to aspiring and seasoned developers alike."
              </p>
              <cite className="text-label text-muted-foreground">
                — Martin Trenker
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-border bg-accent text-accent-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="heading-section observe mb-6 lg:text-6xl">
            Ready to elevate your team's productivity?
          </h2>
          <p className="observe delay-200 mb-12 text-xl leading-relaxed md:text-2xl">
            Let's discuss how clean code practices and strategic AI integration
            can transform your engineering organization.
          </p>
          <div className="observe delay-[400ms] flex flex-wrap justify-center gap-4">
            <Link
              href="/me"
              className="btn bg-foreground text-background transition-all hover:bg-foreground/90"
            >
              Get in Touch
            </Link>
            <Link
              href="/me"
              className="btn border-foreground text-foreground transition-all hover:bg-foreground hover:text-accent"
              style={{ borderWidth: 'var(--border-width)' }}
            >
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
