// Example: Creating a themed component with the design system

import React from 'react';
import Link from 'next/link';

/**
 * Example Card Component
 * Demonstrates how to use design system tokens
 */
export const ExampleCard: React.FC<{
  title: string;
  description: string;
  link?: string;
}> = ({ title, description, link }) => {
  return (
    <article className="observe group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg">
      <h3 className="heading-section mb-4 text-2xl text-card-foreground">
        {title}
      </h3>
      <p className="mb-6 leading-relaxed text-muted-foreground">
        {description}
      </p>
      {link && (
        <Link href={link} className="btn-primary inline-block">
          Learn More
        </Link>
      )}
    </article>
  );
};

/**
 * Example Section Component
 * Shows proper section structure
 */
export const ExampleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'inverted';
}> = ({ title, children, variant = 'default' }) => {
  const isInverted = variant === 'inverted';

  return (
    <section
      className={`section section-border ${
        isInverted ? 'bg-foreground text-background' : 'bg-background text-foreground'
      }`}
    >
      <div className="container-custom">
        <h2 className="heading-section observe mb-12">{title}</h2>
        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
};

/**
 * Example Hero Component
 * Demonstrates composition with design tokens
 */
export const ExampleHero: React.FC = () => {
  return (
    <section className="section relative min-h-[70vh] flex items-center">
      <div className="container-custom">
        <div className="observe max-w-3xl">
          <p className="text-label mb-4 text-accent">Welcome</p>
          <h1 className="heading-display mb-6 text-7xl">
            Design System
            <span className="block text-accent">Example</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            This demonstrates how to build components with the design system tokens
            for consistent, theme-aware interfaces.
          </p>
          <div className="flex gap-4">
            <Link href="/docs" className="btn-primary">
              Documentation
            </Link>
            <Link href="/examples" className="btn-secondary">
              More Examples
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Example Form Component
 * Shows form styling with design tokens
 */
export const ExampleForm: React.FC = () => {
  return (
    <form className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="text-label mb-2 block text-foreground"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full rounded border border-border bg-background px-4 py-2 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-label mb-2 block text-foreground"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full rounded border border-border bg-background px-4 py-2 text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="you@example.com"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Submit
      </button>
    </form>
  );
};

/**
 * Example Grid Layout
 * Shows responsive grid with design system
 */
export const ExampleGrid: React.FC = () => {
  const items = [
    { id: 1, title: 'Feature One', description: 'Description here' },
    { id: 2, title: 'Feature Two', description: 'Description here' },
    { id: 3, title: 'Feature Three', description: 'Description here' },
  ];

  return (
    <section className="section">
      <div className="container-custom">
        <h2 className="heading-section observe mb-12 text-center">
          Features
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="observe border-l-2 border-accent pl-6"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <h3 className="mb-3 font-serif text-2xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Usage Example in a Page
 */
// export default function ExamplePage() {
//   return (
//     <div>
//       <ExampleHero />
//       <ExampleSection title="About" variant="inverted">
//         <p className="text-lg">Content goes here...</p>
//       </ExampleSection>
//       <ExampleGrid />
//     </div>
//   );
// }
