import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { SettingsForm } from './settings-form';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { getLocale, loadMessages } from '@/lib/locale';

const SettingsPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/settings');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const settings = await adapter.getSettings();

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  if (!settings) {
    return (
      <main className="bg-background py-10">
        <Container className="px-6">
          <Heading as="h1" variant="display" className="mb-4 text-4xl text-foreground">
            {intl.formatMessage({ id: 'settings.heading' })}
          </Heading>
          <Card>
            <p className="text-muted-foreground">
              {intl.formatMessage({ id: 'settings.noSettings' })}
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
          {intl.formatMessage({ id: 'settings.heading' })}
        </Heading>
        <p className="mb-8 text-muted-foreground">
          {intl.formatMessage({ id: 'settings.lead' })}
        </p>
        <Card>
          <SettingsForm settings={settings} />
        </Card>
      </Container>
    </main>
  );
};

export default SettingsPage;
