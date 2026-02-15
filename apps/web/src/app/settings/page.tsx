import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { SettingsForm } from './settings-form';

const SettingsPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/settings');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const settings = await adapter.getSettings();

  if (!settings) {
    return (
      <main className="container mx-auto p-10">
        <p>Keine Einstellungen gefunden. Bitte Datenbank konfigurieren.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Einstellungen</h1>
      <div className="rounded-lg border bg-white p-6 shadow">
        <SettingsForm settings={settings} />
      </div>
    </main>
  );
};

export default SettingsPage;
