import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice-pdf';
import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

export async function generateInvoicePDF(
  invoice: InvoiceWithDetails,
  settings: Settings
): Promise<Buffer> {
  const pdfDocument = <InvoicePDF invoice={invoice} settings={settings} />;
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
