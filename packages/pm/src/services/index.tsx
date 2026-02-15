import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from './pdf';
import type { InvoiceWithDetails, Settings } from '../types';

export { InvoicePDF } from './pdf';

export async function generateInvoicePDF(
  invoice: InvoiceWithDetails,
  settings: Settings
): Promise<Buffer> {
  const pdfDocument = <InvoicePDF invoice={invoice} settings={settings} />;
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
