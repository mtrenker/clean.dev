'use client';

/**
 * Global error boundary — rendered when an unhandled error propagates above
 * the root layout (or *within* the root layout itself).
 *
 * Next.js requires this file to ship its own <html> / <body> wrapper because
 * the root layout may be the source of the error and therefore unavailable.
 *
 * Design: keeps the clean.dev brand visible even in the worst-case crash path.
 */
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to platform stderr so the error is observable in Vercel / pod logs.
    // Replace or augment with a real error-tracking SDK (Sentry, Datadog, etc.)
    // when one is wired in.
    console.error('[GlobalError]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
          background: '#0a0a0a',
          color: '#fafafa',
        }}
      >
        <main
          style={{
            maxWidth: '560px',
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          {/* Brand */}
          <p
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: '32px',
            }}
          >
            clean.dev
          </p>

          {/* Error code */}
          <p
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#dc2626',
              marginBottom: '16px',
            }}
          >
            500 — Application error
          </p>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            Something went wrong.
          </h1>

          {/* Body copy */}
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#9ca3af',
              marginBottom: '40px',
            }}
          >
            An unexpected error occurred. The team has been notified. You can try reloading the page or reach out directly at{' '}
            <a
              href="mailto:info@clean.dev"
              style={{ color: '#fafafa', textDecoration: 'underline' }}
            >
              info@clean.dev
            </a>
            .
          </p>

          {/* Digest — helpful for correlating server logs */}
          {error.digest && (
            <p
              style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '11px',
                color: '#374151',
                marginBottom: '32px',
              }}
            >
              ref: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 32px',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: '#fafafa',
                color: '#0a0a0a',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '12px 32px',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid #374151',
                color: '#fafafa',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
