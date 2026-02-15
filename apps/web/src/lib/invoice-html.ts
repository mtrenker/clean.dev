import type { InvoiceWithDetails, Settings } from '@cleandev/pm';

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

export function generateInvoiceHtml(invoice: InvoiceWithDetails, settings: Settings): string {
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

  const addressLines = invoice.client.address.split('\n');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rechnung ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    header { text-align: center; margin-bottom: 40px; }
    header h2 { font-size: 28pt; margin-bottom: 8px; }
    header h3 { font-size: 18pt; font-weight: normal; }
    .header-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address { flex: 1; }
    .address-small { font-size: 8pt; margin-bottom: 4px; }
    .invoice-info { text-align: right; }
    .invoice-info span { display: block; margin-bottom: 4px; }
    .invoice-info .invoice-number { font-weight: bold; }
    .content { margin-bottom: 40px; }
    h4 { font-size: 14pt; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    thead { border-bottom: 2px solid #000; }
    th, td { padding: 8px; text-align: left; }
    th { font-weight: bold; }
    tbody tr { border-bottom: 1px solid #ccc; }
    .text-right { text-align: right; }
    .totals-section { display: flex; justify-content: flex-end; margin-top: 20px; }
    .totals-table { width: 300px; }
    .totals-table tr { border: none; }
    .totals-table .total-row { border-top: 2px solid #000; font-weight: bold; }
    footer { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 40px; text-align: center; font-size: 10pt; }
    .footer-columns { display: flex; justify-content: space-around; }
    .footer-column strong { display: block; margin-bottom: 4px; }
    @media print { body { margin: 0; } .container { padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h2>${settings.contractorName}</h2>
      <h3>Software Beratung</h3>
    </header>

    <div class="header-section">
      <address class="address">
        <div class="address-small">${settings.contractorName}, ${settings.contractorAddress}</div>
        <div>
          ${invoice.client.name}<br>
          ${department ? `– ${department} –<br>` : ''}
          ${addressLines.join('<br>')}
        </div>
      </address>
      <div class="invoice-info">
        <span>Rechnungsdatum: ${formatDate(invoice.invoiceDate)}</span>
        <span>Leistungszeitraum: ${invoice.periodDescription}</span>
        <span class="invoice-number">Rechnungsnummer: ${invoice.invoiceNumber}</span>
      </div>
    </div>

    <div class="content">
      <h4>Rechnung Nr.: ${invoice.invoiceNumber}</h4>
      ${orderNumber ? `<p>bezüglich Bestellnummer: ${orderNumber}</p>` : ''}
      <p>
        Sehr geehrte Damen und Herren,<br>
        hiermit stelle ich Ihnen nachfolgende Leistungen in Rechnung:
      </p>

      <table>
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Beschreibung</th>
            <th class="text-right">Menge</th>
            <th class="text-right">Preis</th>
            <th class="text-right">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}h</td>
            <td class="text-right">${formatPrice(item.unitPrice)}</td>
            <td class="text-right">${formatPrice(item.amount)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <table class="totals-table">
          <tbody>
            <tr>
              <td class="text-right">Nettobetrag:</td>
              <td class="text-right">${formatPrice(subtotal)}</td>
            </tr>
            <tr>
              <td class="text-right">zzgl. ${formatTaxRate(taxRate)} MwSt.:</td>
              <td class="text-right">${formatPrice(taxAmount)}</td>
            </tr>
            <tr class="total-row">
              <td class="text-right">Gesamtbetrag:</td>
              <td class="text-right">${formatPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="margin-top: 32px;">
        Bitte überweisen Sie den Betrag bis zum ${formatDate(new Date(invoice.invoiceDate.getTime() + (invoice.client.paymentDueDays || 30) * 24 * 60 * 60 * 1000))} unter Angabe der Rechnungsnummer auf das unten angegebene Konto.
      </p>

      ${invoice.client.earlyPaymentDiscountRate && invoice.client.earlyPaymentDueDays ? `
      <p style="margin-top: 16px;">
        Bei Zahlung bis zum ${formatDate(new Date(invoice.invoiceDate.getTime() + invoice.client.earlyPaymentDueDays * 24 * 60 * 60 * 1000))} gewähren wir ${formatTaxRate(parseFloat(invoice.client.earlyPaymentDiscountRate))} Skonto.
      </p>
      ` : ''}

      <p style="margin-top: 16px;">Mit freundlichen Grüßen,</p>
      <p style="margin-top: 32px;">${settings.contractorName}</p>
    </div>

    <footer>
      <div class="footer-columns">
        <div class="footer-column">
          <strong>${settings.contractorName}</strong>
          ${settings.contractorAddress}
        </div>
        <div class="footer-column">
          <strong>Bank</strong>
          ${settings.bankName}<br>
          IBAN: ${settings.bankIban}<br>
          BIC: ${settings.bankBic}
        </div>
        <div class="footer-column">
          <strong>Steuer</strong>
          USt-ID: ${settings.vatId}
        </div>
      </div>
      <p style="margin-top: 20px;">© ${new Date().getFullYear()} ${settings.contractorName}</p>
    </footer>
  </div>
</body>
</html>`;
}
