import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { AdminPanel } from './admin-panel';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getLocale, loadMessages } from '@/lib/locale';

const AdminPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
          {intl.formatMessage({ id: 'admin.heading' })}
        </Heading>
        <p className="mb-8 text-muted-foreground">
          {intl.formatMessage({ id: 'admin.lead' })}
        </p>
        <AdminPanel />
      </Container>
    </main>
  );
};

export default AdminPage;
