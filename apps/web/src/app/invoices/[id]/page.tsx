import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicePDFViewer } from '@/components/invoice-pdf-viewer';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getLocale, loadMessages } from '@/lib/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

const InvoicePage = async ({ params }: PageProps) => {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  const { id } = await params;
  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const invoice = await adapter.getInvoice(id);
  const settings = await adapter.getSettings();

  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  if (!invoice) {
    return (
      <main className="bg-background py-10">
        <Container className="px-6">
          <p className="text-muted-foreground">{intl.formatMessage({ id: 'invoices.notFound' })}</p>
        </Container>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="bg-background py-10">
        <Container className="px-6">
          <p className="text-muted-foreground">{intl.formatMessage({ id: 'settings.notFound' })}</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-6 text-4xl text-foreground">
          {intl.formatMessage({ id: 'invoices.heading' })} {invoice.invoiceNumber}
        </Heading>
        <InvoicePDFViewer invoice={invoice} settings={settings} />
      </Container>
    </main>
  );
};

export default InvoicePage;
