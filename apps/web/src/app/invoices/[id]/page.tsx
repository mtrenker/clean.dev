import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicePDFViewer } from '@/components/invoice-pdf-viewer';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

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

  if (!invoice) {
    return (
      <main className="bg-background py-10">
        <Container className="px-6">
          <p className="text-muted-foreground">Rechnung nicht gefunden</p>
        </Container>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="bg-background py-10">
        <Container className="px-6">
          <p className="text-muted-foreground">Einstellungen nicht gefunden</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <Heading as="h1" variant="display" className="mb-6 text-4xl text-foreground">
          Rechnung {invoice.invoiceNumber}
        </Heading>
        <InvoicePDFViewer invoice={invoice} settings={settings} />
      </Container>
    </main>
  );
};

export default InvoicePage;
