import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { AdminPanel } from './admin-panel';
import { Container, Heading, Section } from '@/components/ui';
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
    <main id="main-content" className="bg-background">
      <Section className="py-10" noBorder>
        <Container className="space-y-8 px-6">
          <div>
            <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
              {intl.formatMessage({ id: 'admin.heading' })}
            </Heading>
            <p className="text-muted-foreground">
              {intl.formatMessage({ id: 'admin.lead' })}
            </p>
          </div>
          <AdminPanel />
        </Container>
      </Section>
    </main>
  );
};

export default AdminPage;
