import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { ClientsManagement } from './clients-management';

const ClientsPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/clients');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const clients = await adapter.getClients();

  return (
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Kundenverwaltung</h1>
      <ClientsManagement clients={clients} />
    </main>
  );
};

export default ClientsPage;
