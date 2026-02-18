import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice-pdf';
import { generateEpcQrCodeDataUrl } from '@/lib/epc-qr';
import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

export async function generateInvoicePDF(
  invoice: InvoiceWithDetails,
  settings: Settings
): Promise<Buffer> {
  const epcQrCodeUrl = await generateEpcQrCodeDataUrl(invoice, settings);
  const pdfDocument = <InvoicePDF invoice={invoice} settings={settings} epcQrCodeUrl={epcQrCodeUrl} />;
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
