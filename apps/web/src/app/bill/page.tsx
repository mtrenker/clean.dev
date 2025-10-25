'use client';
import type { NextPage } from 'next';

const formatPrice = (number: number) => new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(number);

const formatTaxRate = (number: number) => new Intl.NumberFormat('de-DE', {
  style: 'percent',
}).format(number);

const formatDate = (date: Date) => new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
}).format(date);

const InvoicePage: NextPage = () => {

  const customerName = 'John Doe';
  const customerAddress = 'Musterstraße 123, 12345 Musterstadt';
  const companyName = 'Example GmbH';
  const companyAddress = 'Beispielstr. 1 12345 Beispielstadt';
  const invoiceDate = new Date();
  const leistungZeitraum = 'September 2025';
  const invoiceNumber = '202510011';
  const orderNumber = '450054638';
  const hours = 176.5;
  const hourlyRate = 80;
  const total = hours * hourlyRate;
  const taxRate = 0.19;
  const tax = total * taxRate;
  const totalPlusTax = total + tax;
  const bankName = 'Example Bank';
  const bankIBAN = 'DE12 3456 7890 1234 5678 90';
  const bankBIC = 'EXAMPLEDEXXX';
  const companyVATID = 'DE123456789';


  return (
    <main className="container mx-auto grid grid-rows-[max-content_max-content_1fr_max-content] gap-10 print:h-[105vh]">
      <header className="mt-14">
        <h2 className="text-center text-4xl">{customerName}</h2>
        <h3 className="text-center text-2xl">Software Beratung</h3>
      </header>
      <div className="flex justify-between">
        <address className="flex grow-0 flex-col">
          <span className="text-xs">
            {customerName}, {customerAddress}
          </span>
          <span>
            {companyName}
            <br />
            – Rechnungswesen –
            <br />
            {companyAddress}
          </span>
        </address>
        <div className="flex grow-0 flex-col">
          <span>Rechnungsdatum: {formatDate(invoiceDate)}</span>
          <span>Leistungszeitraum: {leistungZeitraum}</span>
          <span className="font-bold">Rechnungsnummer: {invoiceNumber}</span>
        </div>
      </div>
      <div>
        <h4 className="m-0 mb-4 text-lg font-bold">Rechnung Nr.: {invoiceNumber}</h4>
        <h3 className="m-0 mb-4 text-lg font-bold">Bestellnummer: {orderNumber}</h3>
        <p className="flex flex-col gap-4">
          <span>Sehr geehrte Damen und Herren,</span>
          <span>hiermit erlaube ich mir Ihnen folgende Leistungen in Rechnung zu stellen:</span>
        </p>
        <table className="my-10 w-full">
          <thead>
            <tr className="bg-stone-100">
              <th className="text-start">Pos.</th>
              <th className="text-start">Bezeichnung</th>
              <th className="text-end">Stunden</th>
              <th className="text-end">Einzelpreis</th>
              <th className="text-end">Gesamt</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-b [&_td]:border-black">
            <tr>
              <td className="text-start">1</td>
              <td className="text-start">Beratung / Entwicklung</td>
              <td className="text-end">{hours}</td>
              <td className="text-end">{formatPrice(hourlyRate)}</td>
              <td className="text-end">{formatPrice(total)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-4 flex justify-end">
          <table className="w-2/3">
            <tbody>
              <tr>
                <td>Summe (netto)</td>
                <td />
                <td className="text-end">{formatPrice(total)}</td>
              </tr>
              <tr>
                <td>{`zzgl. Ust. ${formatTaxRate(taxRate)}`}</td>
                <td />
                <td className="text-end">{formatPrice(tax)}</td>
              </tr>
              <tr className="border-b border-black dark:border-white">
                <td className="font-bold">Gesamt</td>
                <td />
                <td className="text-end font-bold">{formatPrice(totalPlusTax)}</td>
              </tr>
              <tr className="border-b-4 border-double border-black dark:border-white">
                <td className="font-bold">Rechnungsbetrag</td>
                <td />
                <td className="text-end font-bold">{formatPrice(totalPlusTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-1">
          Zahlungsziel: <strong>30 Tage</strong>< br />
          Ich bitte um Überweisung auf das unten genannte Konto.
        </p>
      </div>
      <footer className="flex">
        <div className="flex flex-1 flex-col">
          <address className="flex-1">
            {customerName}
            <br />
            {customerAddress}
          </address>
        </div>
        <div className="flex flex-1 flex-col">
          <span>{bankName}</span>
          <span>IBAN: {bankIBAN}</span>
          <span>BIC: {bankBIC}</span>
          <span>USt-ID: {companyVATID}</span>
        </div>
      </footer>
    </main >
  );
};

export default InvoicePage;
