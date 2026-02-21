import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { ClientsManagement } from './clients-management';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

const ClientsPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/clients');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const clients = await adapter.getClients();

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          Kundenverwaltung
        </Heading>
        <p className="mb-8 text-muted-foreground">
          Verwalten Sie Kundeninformationen, Zahlungsbedingungen und Kontaktdaten
        </p>
        <ClientsManagement clients={clients} />
      </Container>
    </main>
  );
};

export default ClientsPage;
