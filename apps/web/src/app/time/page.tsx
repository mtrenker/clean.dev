import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { TimeTracking } from './time-tracking';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getLocale, loadMessages } from '@/lib/locale';

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

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          {intl.formatMessage({ id: 'time.heading' })}
        </Heading>
        <p className="mb-8 text-muted-foreground">
          {intl.formatMessage({ id: 'time.lead' })}
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
