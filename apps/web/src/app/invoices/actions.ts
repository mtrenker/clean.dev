'use server';

import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import type { CreateInvoice } from '@cleandev/pm';
import { revalidatePath } from 'next/cache';

export async function createInvoiceAction(data: Omit<CreateInvoice, 'invoiceDate'> & { date: string }) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const invoice = await adapter.createInvoice({
    ...data,
    invoiceDate: new Date(data.date),
  });

  revalidatePath('/invoices');
  revalidatePath('/time');
  return invoice;
}

export async function deleteInvoiceAction(id: string) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  await adapter.deleteInvoice(id);
  revalidatePath('/invoices');
  revalidatePath('/time');
}

export async function getUninvoicedEntriesAction(options?: { clientId?: string; fromDate?: string; toDate?: string }) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  return adapter.getUninvoicedTimeEntries({
    clientId: options?.clientId,
    fromDate: options?.fromDate ? new Date(options.fromDate) : undefined,
    toDate: options?.toDate ? new Date(options.toDate) : undefined,
  });
}

export async function getNextInvoiceNumberAction(date: string): Promise<string> {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  return adapter.getNextInvoiceNumber(new Date(date));
}

export async function sendInvoiceAction(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  try {
    const pool = getPool();
    const adapter = createAdapter('postgres', pool);

    // Get invoice and settings
    const invoice = await adapter.getInvoice(id);
    const settings = await adapter.getSettings();

    if (!invoice) {
      return { success: false, error: 'Rechnung nicht gefunden' };
    }

    if (!settings) {
      return { success: false, error: 'Einstellungen nicht gefunden' };
    }

    // Get client email
    const clientEmail =
      invoice.client.customFields &&
      typeof invoice.client.customFields === 'object' &&
      'email' in invoice.client.customFields
        ? String(invoice.client.customFields.email)
        : null;

    if (!clientEmail) {
      return { success: false, error: 'Kunde hat keine E-Mail-Adresse hinterlegt' };
    }

    // Generate PDF
    const { generateInvoiceHtml } = await import('@/lib/invoice-html');
    const { generatePdfFromHtml } = await import('@/lib/pdf');
    const { sendEmail } = await import('@/lib/email');

    const html = generateInvoiceHtml(invoice, settings);
    const pdfBuffer = await generatePdfFromHtml(html);

    // Send email
    await sendEmail({
      to: clientEmail,
      subject: `Rechnung ${invoice.invoiceNumber}`,
      html: `
        <p>Sehr geehrte Damen und Herren,</p>
        <p>anbei erhalten Sie die Rechnung ${invoice.invoiceNumber} vom ${new Intl.DateTimeFormat('de-DE').format(invoice.invoiceDate)}.</p>
        <p>Mit freundlichen Grüßen,<br>${settings.contractorName}</p>
      `,
      attachments: [
        {
          filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // Mark as sent
    await adapter.markInvoiceSent(id);
    revalidatePath('/invoices');

    return { success: true };
  } catch (error) {
    console.error('Error sending invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Versenden der Rechnung',
    };
  }
}
