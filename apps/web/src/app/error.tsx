'use client';

/**
 * Root-level route error boundary — rendered when a Server Component in any
 * page segment throws an unhandled exception (excludes layout.tsx errors,
 * which are caught by global-error.tsx).
 *
 * Inherits the root layout (navigation + footer) so users always have a way
 * back to the rest of the site.
 */
import { useEffect } from 'react';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Emit to platform logs so the error is observable.
    // Augment with an error-tracking SDK when one is available.
    console.error('[RouteError]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-[80vh] items-center bg-background">
      <Section noBorder>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            {/* Error label */}
            <p className="text-label mb-4 tracking-[0.3em] text-destructive">
              Error
            </p>

            {/* Heading */}
            <Heading as="h1" variant="display" className="mb-6 text-5xl md:text-6xl">
              Something went wrong.
            </Heading>

            {/* Body */}
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
              An unexpected error occurred while loading this page. You can try
              again or go back to the home page.
            </p>

            {/* Correlation digest — helps match client errors to server logs */}
            {error.digest && (
              <p className="mb-8 font-mono text-xs text-muted-foreground/50">
                ref: {error.digest}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={reset}
                className="btn-primary"
                type="button"
              >
                Try again
              </button>
              <Link href="/" className="btn-secondary">
                Go home
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
