import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { ClientsManagement } from './clients-management';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getLocale, loadMessages } from '@/lib/locale';

const ClientsPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/clients');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const clients = await adapter.getClients();

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          {intl.formatMessage({ id: 'clients.heading' })}
        </Heading>
        <p className="mb-8 text-muted-foreground">
          {intl.formatMessage({ id: 'clients.lead' })}
        </p>
        <ClientsManagement clients={clients} />
      </Container>
    </main>
  );
};

export default ClientsPage;
