import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';

const formatPrice = (number: number | string): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
};

const formatTaxRate = (number: number | string): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('de-DE', { style: 'percent' }).format(num);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date);
};

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

  const subtotal = parseFloat(invoice.subtotal);
  const taxRate = parseFloat(invoice.taxRate);
  const taxAmount = parseFloat(invoice.taxAmount);
  const total = parseFloat(invoice.total);

  const orderNumber =
    invoice.client.customFields &&
    typeof invoice.client.customFields === 'object' &&
    'orderNumber' in invoice.client.customFields
      ? String(invoice.client.customFields.orderNumber)
      : null;

  const department =
    invoice.client.customFields &&
    typeof invoice.client.customFields === 'object' &&
    'department' in invoice.client.customFields
      ? String(invoice.client.customFields.department)
      : null;

  return (
    <main className="container mx-auto grid grid-rows-[max-content_max-content_1fr_max-content] gap-10 print:h-[105vh]">
      <header className="mt-14">
        <h2 className="text-center text-4xl">{settings.contractorName}</h2>
        <h3 className="text-center text-2xl">Software Beratung</h3>
      </header>

      <div className="flex justify-between">
        <address className="flex grow-0 flex-col">
          <span className="text-xs">
            {settings.contractorName}, {settings.contractorAddress}
          </span>
          <address className="whitespace-break-spaces not-italic">
            {invoice.client.name}
            {invoice.client.address}
          </address>
        </address>
        <div className="flex grow-0 flex-col">
          <span>Rechnungsdatum: {formatDate(invoice.invoiceDate)}</span>
          <span>Leistungszeitraum: {invoice.periodDescription}</span>
          <span className="font-bold">Rechnungsnummer: {invoice.invoiceNumber}</span>
        </div>
      </div>

      <div>
        <h4 className="m-0 mb-4 text-lg font-bold">Rechnung Nr.: {invoice.invoiceNumber}</h4>
        {orderNumber && (
          <p>bezüglich Bestellnummer: {orderNumber}</p>
        )}
        <p className="mb-4">
          Sehr geehrte Damen und Herren,
          <br />
          hiermit stelle ich Ihnen nachfolgende Leistungen in Rechnung:
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-2 text-left">Pos.</th>
              <th className="p-2 text-left">Beschreibung</th>
              <th className="p-2 text-right">Menge</th>
              <th className="p-2 text-right">Preis</th>
              <th className="p-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity}h</td>
                <td className="p-2 text-right">{formatPrice(item.unitPrice)}</td>
                <td className="p-2 text-right">{formatPrice(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <table className="w-64">
            <tbody>
              <tr>
                <td className="p-2 text-right">Nettobetrag:</td>
                <td className="p-2 text-right">{formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td className="p-2 text-right">zzgl. {formatTaxRate(taxRate)} MwSt.:</td>
                <td className="p-2 text-right">{formatPrice(taxAmount)}</td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="p-2 text-right font-bold">Gesamtbetrag:</td>
                <td className="p-2 text-right font-bold">{formatPrice(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8">
          Bitte überweisen Sie den Betrag bis zum {formatDate(new Date(invoice.invoiceDate.getTime() + (invoice.client.paymentDueDays || 30) * 24 * 60 * 60 * 1000))} unter Angabe der Rechnungsnummer auf das unten angegebene Konto.
        </p>

        {invoice.client.earlyPaymentDiscountRate && invoice.client.earlyPaymentDueDays && (
          <p className="mt-4">
            Bei Zahlung bis zum {formatDate(new Date(invoice.invoiceDate.getTime() + invoice.client.earlyPaymentDueDays * 24 * 60 * 60 * 1000))} gewähren wir {formatTaxRate(parseFloat(invoice.client.earlyPaymentDiscountRate))} Skonto.
          </p>
        )}

        <p className="mt-4">Mit freundlichen Grüßen,</p>
        <p className="mt-8">{settings.contractorName}</p>
      </div>

      <footer className="border-t border-gray-300 pt-4 text-sm">
        <div className="flex justify-around">
          <div>
            <strong>{settings.contractorName}</strong>
            <address className="whitespace-break-spaces not-italic">
              {settings.contractorAddress}
            </address>
          </div>
          <div>
            <strong>{settings.bankName}</strong>
            <br />
            IBAN: {settings.bankIban}
            <br />
            BIC: {settings.bankBic}
          </div>
          <div>
            <strong>USt-ID</strong>
            <br />
            {settings.vatId}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default InvoicePage;
