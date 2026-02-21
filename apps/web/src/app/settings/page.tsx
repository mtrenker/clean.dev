import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { SettingsForm } from './settings-form';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';

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
      <main className="bg-background py-10">
        <Container className="px-6">
          <Heading as="h1" variant="display" className="mb-4 text-4xl text-foreground">
            Einstellungen
          </Heading>
          <Card>
            <p className="text-muted-foreground">
              Keine Einstellungen gefunden. Bitte führen Sie zunächst die Datenbankmigration im Admin-Bereich durch.
            </p>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          Einstellungen
        </Heading>
        <p className="mb-8 text-muted-foreground">
          Konfigurieren Sie Ihre Firmendaten, Bankverbindung und Standard-Abrechnungssätze
        </p>
        <Card>
          <SettingsForm settings={settings} />
        </Card>
      </Container>
    </main>
  );
};

export default SettingsPage;
