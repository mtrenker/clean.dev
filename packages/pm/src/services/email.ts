import nodemailer from 'nodemailer';
import type { InvoiceWithDetails, Client } from '../types';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function createSMTPTransport(config: SMTPConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
}

export async function sendInvoiceEmail(
  config: SMTPConfig,
  client: Client,
  invoice: InvoiceWithDetails,
  pdfBuffer: Buffer,
  recipientEmail?: string
): Promise<EmailResult> {
  try {
    const transporter = createSMTPTransport(config);

    // Build email recipient
    const to = recipientEmail || (client.customFields?.email as string | undefined);

    if (!to) {
      throw new Error('No recipient email address provided');
    }

    // Format total in German
    const total = parseFloat(invoice.total);
    const formattedTotal = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(total);

    // Format date in German
    const formattedDate = new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
    }).format(invoice.invoiceDate);

    const subject = `Rechnung ${invoice.invoiceNumber} - ${invoice.periodDescription}`;

    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Sehr geehrte Damen und Herren,</p>

          <p>anbei erhalten Sie die Rechnung für den Leistungszeitraum <strong>${invoice.periodDescription}</strong>.</p>

          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #0066cc;">
            <p style="margin: 5px 0;"><strong>Rechnungsnummer:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Rechnungsdatum:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Rechnungsbetrag:</strong> ${formattedTotal}</p>
          </div>

          <p>Die Rechnung finden Sie im Anhang als PDF-Dokument.</p>

          <p>Zahlungsziel: <strong>30 Tage</strong></p>

          <p>Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>

          <p>Mit freundlichen Grüßen</p>
        </body>
      </html>
    `;

    const textBody = `
Sehr geehrte Damen und Herren,

anbei erhalten Sie die Rechnung für den Leistungszeitraum ${invoice.periodDescription}.

Rechnungsnummer: ${invoice.invoiceNumber}
Rechnungsdatum: ${formattedDate}
Rechnungsbetrag: ${formattedTotal}

Die Rechnung finden Sie im Anhang als PDF-Dokument.

Zahlungsziel: 30 Tage

Bei Fragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
    `.trim();

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
