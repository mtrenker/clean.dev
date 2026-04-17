import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter, type Invoice, type Client } from '@cleandev/pm';
import { InvoicesManagement } from './invoices-management';
import { Container, Heading, Section } from '@/components/ui';
import { getLocale, loadMessages } from '@/lib/locale';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/invoices');
  }

  let invoices: Invoice[];
  let clients: Client[];
  try {
    const pool = getPool();
    const adapter = createAdapter('postgres', pool);
    [invoices, clients] = await Promise.all([
      adapter.getInvoices(),
      adapter.getClients(),
    ]);
  } catch (err) {
    console.error('[InvoicesPage] Failed to load invoices or clients:', err);
    throw err; // Caught by the nearest error.tsx boundary
  }

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main id="main-content" className="bg-background">
      <Section className="py-10" noBorder>
        <Container className="space-y-8 px-6">
          <div>
            <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
              {intl.formatMessage({ id: 'invoices.heading' })}
            </Heading>
            <p className="text-muted-foreground">
              {intl.formatMessage({ id: 'invoices.lead' })}
            </p>
          </div>
          <InvoicesManagement invoices={invoices} clients={clients} />
        </Container>
      </Section>
    </main>
  );
};

export default InvoicesPage;
