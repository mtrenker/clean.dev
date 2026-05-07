import type { PropsWithChildren } from 'react';
import { auth } from 'auth';
import { requireAdminSession } from '@/lib/authz';
import { Container } from '@/components/ui';
import { Link } from '@/components/ui';

/**
 * Cockpit layout.
 *
 * Guards all `/cockpit/**` routes behind an admin session check.
 * Unauthenticated visitors are redirected to the sign-in page with a
 * `callbackUrl` pointing back to `/cockpit`.
 */
const CockpitLayout = async ({ children }: PropsWithChildren) => {
  const session = await auth();
  requireAdminSession(session, '/cockpit');

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* Cockpit sub-navigation */}
      <div className="border-b border-border bg-muted/30">
        <Container className="px-4 py-2 sm:px-6">
          <nav aria-label="Cockpit navigation" className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cockpit
            </span>
            <div className="h-3 w-px bg-border" aria-hidden="true" />
            <Link href="/cockpit" variant="nav" className="text-xs">
              Overview
            </Link>
          </nav>
        </Container>
      </div>

      {/* Page content */}
      <Container className="px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </Container>
    </main>
  );
};

export default CockpitLayout;
