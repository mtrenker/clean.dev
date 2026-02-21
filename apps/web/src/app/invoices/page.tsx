import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicesManagement } from './invoices-management';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/invoices');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const invoices = await adapter.getInvoices();
  const clients = await adapter.getClients();

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          Rechnungsverwaltung
        </Heading>
        <p className="mb-8 text-muted-foreground">
          Erstellen und versenden Sie Rechnungen basierend auf erfassten Zeiteinträgen
        </p>
        <InvoicesManagement invoices={invoices} clients={clients} />
      </Container>
    </main>
  );
};

export default InvoicesPage;
