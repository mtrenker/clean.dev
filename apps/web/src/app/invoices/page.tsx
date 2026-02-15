import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicesManagement } from './invoices-management';

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
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Rechnungsverwaltung</h1>
      <InvoicesManagement invoices={invoices} clients={clients} />
    </main>
  );
};

export default InvoicesPage;
