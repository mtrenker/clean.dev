import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import { InvoicePDFViewer } from '@/components/invoice-pdf-viewer';

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
      <main className="container mx-auto p-10">
        <p>Rechnung nicht gefunden</p>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="container mx-auto p-10">
        <p>Einstellungen nicht gefunden</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-10">
      <h1 className="mb-6 text-3xl font-bold">Rechnung {invoice.invoiceNumber}</h1>
      <InvoicePDFViewer invoice={invoice} settings={settings} />
    </main>
  );
};

export default InvoicePage;
