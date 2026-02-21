import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { TimeTracking } from './time-tracking';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

interface PageProps {
  searchParams: Promise<{ clientId?: string }>;
}

const TimeTrackingPage = async ({ searchParams }: PageProps) => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/time');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const { clientId } = await searchParams;
  const clients = await adapter.getClients();
  const settings = await adapter.getSettings();
  const timeEntries = await adapter.getTimeEntries(clientId);

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          Zeiterfassung
        </Heading>
        <p className="mb-8 text-muted-foreground">
          Erfassen Sie Arbeitszeiten und Projektbeschreibungen für die Rechnungserstellung
        </p>
        <TimeTracking
          clients={clients}
          timeEntries={timeEntries}
          defaultRate={settings?.defaultHourlyRate || '80.00'}
        />
      </Container>
    </main>
  );
};

export default TimeTrackingPage;
