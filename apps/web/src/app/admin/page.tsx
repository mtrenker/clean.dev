import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from './admin-panel';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

const AdminPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          Administration
        </Heading>
        <p className="mb-8 text-muted-foreground">
          System configuration and database management
        </p>
        <AdminPanel />
      </Container>
    </main>
  );
};

export default AdminPage;
