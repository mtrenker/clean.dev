import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicesManagement } from './invoices-management';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getLocale, loadMessages } from '@/lib/locale';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/invoices');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const invoices = await adapter.getInvoices();
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
          {intl.formatMessage({ id: 'invoices.heading' })}
        </Heading>
        <p className="mb-8 text-muted-foreground">
          {intl.formatMessage({ id: 'invoices.lead' })}
        </p>
        <InvoicesManagement invoices={invoices} clients={clients} />
      </Container>
    </main>
  );
};

export default InvoicesPage;
