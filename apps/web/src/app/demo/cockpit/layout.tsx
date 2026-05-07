import type { PropsWithChildren } from 'react';
import { Container, Link } from '@/components/ui';

const DemoCockpitLayout = ({ children }: PropsWithChildren) => (
  <main id="main-content" className="min-h-screen bg-background">
    <div className="border-b border-border bg-muted/30">
      <Container className="px-4 py-2 sm:px-6">
        <nav aria-label="Demo cockpit navigation" className="flex items-center gap-4">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Demo Cockpit
          </span>
          <div className="h-3 w-px bg-border" aria-hidden="true" />
          <Link href="/demo/cockpit" variant="nav" className="text-xs">
            Overview
          </Link>
        </nav>
      </Container>
    </div>

    <Container className="px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </Container>
  </main>
);

export default DemoCockpitLayout;
