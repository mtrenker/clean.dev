import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from './admin-panel';

const AdminPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  return (
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Administration</h1>
      <AdminPanel />
    </main>
  );
};

export default AdminPage;
