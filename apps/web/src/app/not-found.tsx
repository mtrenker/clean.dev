/**
 * Branded 404 page — rendered by Next.js when:
 *  - no route matches the requested URL, OR
 *  - a Server Component calls `notFound()` explicitly.
 *
 * Lives at the root app directory so it inherits the root layout (navigation,
 * footer, theme) without needing to duplicate the shell.
 */
import React from 'react';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-[80vh] items-center justify-center bg-background">
      <Section noBorder className="w-full">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            {/* Error label */}
            <p className="text-label mb-4 tracking-[0.3em] text-accent">
              404
            </p>

            {/* Heading */}
            <Heading as="h1" variant="display" className="mb-6 text-5xl md:text-6xl">
              Page not found.
            </Heading>

            {/* Body */}
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              If you believe this is a mistake, please{' '}
              <Link href="/contact" className="underline underline-offset-2 transition-colors hover:text-accent">
                get in touch
              </Link>
              .
            </p>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="btn-primary">
                Go home
              </Link>
              <Link href="/work" className="btn-secondary">
                View portfolio
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
