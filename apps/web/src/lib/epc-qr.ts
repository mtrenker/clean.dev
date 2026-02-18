import QRCode from 'qrcode';
import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

/**
 * Builds the EPC QR code payload string according to the EPC069-12 standard.
 * This format is used by European banking apps to pre-fill SEPA credit transfers.
 *
 * @see https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation
 */
const buildEpcPayload = (invoice: InvoiceWithDetails, settings: Settings): string => {
  const lines = [
    'BCD',                                    // Service Tag
    '002',                                    // Version
    '1',                                      // Character set (1 = UTF-8)
    'SCT',                                    // Identification code (SEPA Credit Transfer)
    settings.bankBic,                         // BIC of the beneficiary bank
    settings.contractorName,                  // Name of the beneficiary (max 70 chars)
    settings.bankIban.replace(/\s/g, ''),     // IBAN (no spaces)
    `EUR${parseFloat(invoice.total).toFixed(2)}`, // Amount
    '',                                       // Purpose code (optional)
    '',                                       // Structured reference (optional)
    `Rechnung ${invoice.invoiceNumber}`,      // Unstructured remittance info (max 140 chars)
  ];

  return lines.join('\n');
};

/**
 * Generates an EPC QR code as a PNG data URL for embedding in PDFs.
 */
export const generateEpcQrCodeDataUrl = async (
  invoice: InvoiceWithDetails,
  settings: Settings,
): Promise<string> => {
  const payload = buildEpcPayload(invoice, settings);

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};
