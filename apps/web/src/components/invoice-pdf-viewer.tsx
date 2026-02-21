'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { useIntl } from 'react-intl';
import { InvoicePDF } from '@/components/invoice-pdf';
import { generateEpcQrCodeDataUrl } from '@/lib/epc-qr';
import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

interface InvoicePDFViewerProps {
  invoice: InvoiceWithDetails;
  settings: Settings;
}

export const InvoicePDFViewer: React.FC<InvoicePDFViewerProps> = ({ invoice, settings }) => {
  const intl = useIntl();
  const [epcQrCodeUrl, setEpcQrCodeUrl] = useState<string | undefined>();

  useEffect(() => {
    generateEpcQrCodeDataUrl(invoice, settings).then(setEpcQrCodeUrl);
  }, [invoice, settings]);

  const document = <InvoicePDF invoice={invoice} settings={settings} epcQrCodeUrl={epcQrCodeUrl} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <PDFDownloadLink
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          document={document}
          fileName={`Rechnung_${invoice.invoiceNumber}.pdf`}
        >
          {({ loading }) => (loading
            ? intl.formatMessage({ id: 'pdf.loading' })
            : intl.formatMessage({ id: 'pdf.download' }))}
        </PDFDownloadLink>
      </div>

      <BlobProvider document={document}>
        {({ url, loading, error }) => {
          if (loading) {
            return (
              <div className="flex h-[80vh] items-center justify-center rounded border bg-gray-50">
                <p className="text-gray-500">{intl.formatMessage({ id: 'pdf.loading2' })}</p>
              </div>
            );
          }

          if (error) {
            return (
              <div className="flex h-[80vh] items-center justify-center rounded border bg-red-50">
                <p className="text-red-600">{intl.formatMessage({ id: 'pdf.error' }, { message: error.message })}</p>
              </div>
            );
          }

          if (!url) {
            return null;
          }

          return (
            <iframe
              className="h-[80vh] w-full rounded border"
              src={url}
              title={`Rechnung ${invoice.invoiceNumber}`}
            />
          );
        }}
      </BlobProvider>
    </div>
  );
};
