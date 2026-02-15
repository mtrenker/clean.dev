import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { TimeTracking } from './time-tracking';

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
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Zeiterfassung</h1>
      <TimeTracking
        clients={clients}
        timeEntries={timeEntries}
        defaultRate={settings?.defaultHourlyRate || '80.00'}
      />
    </main>
  );
};

export default TimeTrackingPage;
