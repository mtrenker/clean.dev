import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { differenceInMinutes, format, addDays } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import { useGetProjectWithTrackingsQuery, useMeQuery } from '../../../graphql/generated';
import { TextField } from '../../../common/components/TextField';

const formatPrice = (number: number) => new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(number);

const formatTaxRate = (number: number) => new Intl.NumberFormat('de-DE', {
  style: 'percent',
}).format(number);

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM'));
  const { data } = useGetProjectWithTrackingsQuery({
    variables: {
      id: id as string,
      date,
    },
  });
  const { data: userData } = useMeQuery();
  const project = data?.project;

  const categories = project?.trackings.reduce((acc, tracking) => {
    const category = tracking.category ?? 'Sonstiges';
    const hours = differenceInMinutes(new Date(tracking.endTime ?? ''), new Date(tracking.startTime)) / 60;
    if (acc[category]) {
      acc[category] += hours;
    } else {
      acc[category] = hours;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.entries(categories ?? {}).reduce((acc, [categoryName, hours]) => {
    const rate = project?.categories.find(category => category.name === categoryName)?.rate ?? 0;
    acc += (hours * rate);
    return acc;
  }, 0);
  const taxRate = 0.19;
  const tax = total * taxRate;
  const totalPlusTax = total + tax;

  const contact = userData?.me?.contact;

  const lastMonth = new Date().setMonth(new Date().getMonth() - 1);

  const [invoiceNumber, setInvoiceNumber] = useState(`${format(new Date(), 'yyyyMMdd')}1`);
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'dd.MM.yyyy'));
  const [invoiceDeliveryDate, setInvoiceDeliveryDate] = useState(format(lastMonth, 'MMMM yyyy'));

  return (
    <main className="container mx-auto grid grid-rows-[max-content_max-content_1fr_max-content] gap-10 print:h-[105vh]">
      <div className="print:hidden">
        <ReactDatePicker
          dateFormat="yyyy-MM"
          onChange={(date: Date) => { setDate(format(date, 'yyyy-MM')); }}
          selected={new Date(date)}
          showMonthYearPicker
        />
      </div>
      <div className="flex gap-4 print:hidden">
        <div className="flex-1">
          <TextField defaultValue={invoiceDate} label="Rechnungsdatum" onChange={(e) => { setInvoiceDate(e.target.value); }} />
        </div>
        <div className="flex-1">
          <TextField
            defaultValue={invoiceDeliveryDate}
            label="Leistungszeitraum"
            onChange={(e) => { setInvoiceDeliveryDate(e.target.value); }}
          />
        </div>
        <div className="flex-1">
          <TextField
            defaultValue={invoiceNumber}
            label="Rechnungsnummer"
            onChange={(e) => { setInvoiceNumber(e.target.value); }}
          />
        </div>
      </div>
      <header className="mt-14">
        <h2 className="text-center text-4xl">{`${contact?.firstName} ${contact?.lastName}`}</h2>
        <h3 className="text-center text-2xl">Software Beratung</h3>
      </header>
      <div className="flex justify-between">
        <address className="flex grow-0 flex-col">
          <span className="text-xs">
            {`${contact?.firstName} ${contact?.lastName}, ${contact?.street}, ${contact?.zip} ${contact?.city}`}
          </span>
          <span>
            {project?.contact?.company}
            <br />
            {`${project?.contact?.firstName} ${project?.contact?.lastName}`}
            <br />
            {project?.contact?.street}
            <br />
            {`${project?.contact?.zip} ${project?.contact?.city}`}
          </span>
        </address>
        <div className="flex grow-0 flex-col">
          <span>{`Rechnungsdatum: ${invoiceDate}`}</span>
          <span>{`Leistungszeitraum: ${invoiceDeliveryDate}`}</span>
          <span className="font-bold">{`Rechnungsnummer: ${invoiceNumber}`}</span>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-2xl">
          Rechnung
          {' '}
          {invoiceNumber}
        </h4>
        <h3 className="mb-4 text-xl">{project?.client}</h3>
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
              <th className="text-end">MwSt.</th>
              <th className="text-end">Preis</th>
              <th className="text-end">Gesamt</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-b [&_td]:border-black">
            {Object.entries(categories ?? {}).map(([category, hours], index) => {
              const { rate } = project?.categories.find(({ name }) => name === category) ?? {};
              return (
                <tr key={category}>
                  <td className="text-start">{index + 1}</td>
                  <td className="text-start">Beratung / Entwicklung</td>
                  <td className="text-end">{hours}</td>
                  <td className="text-end">{formatTaxRate(taxRate)}</td>
                  <td className="text-end">{formatPrice(rate ?? 0)}</td>
                  <td className="text-end">{formatPrice(hours * (rate ?? 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mb-4 flex justify-end">
          <table className="w-2/3">
            <tbody>
              <tr>
                <td>Summe netto</td>
                <td />
                <td className="text-end">{formatPrice(total)}</td>
              </tr>
              <tr>
                <td>{`MwSt. ${formatTaxRate(taxRate)}`}</td>
                <td />
                <td className="text-end">{formatPrice(tax)}</td>
              </tr>
              <tr className="border-b border-black dark:border-white">
                <td className="font-bold">Gesamt</td>
                <td />
                <td className="text-end font-bold">{formatPrice(totalPlusTax)}</td>
              </tr>
              <tr className="border-b-4 border-double border-black dark:border-white">
                <td className="font-bold">Zu zahlen</td>
                <td />
                <td className="text-end font-bold">{formatPrice(totalPlusTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-1">
          Bitte überweisen Sie den Rechnungsbetrag bis zum
          {' '}
          <strong>{format(addDays(new Date(), 30), 'dd.MM.yyyy')}</strong>
          {' '}
          auf das unten angegebene Konto.
        </p>
        <p>
          Ich bedanke mich für das entgegengebrachte Vertrauen und freue mich auf eine weitere Zusammenarbeit.
        </p>
      </div>
      <footer className="flex">
        <div className="flex flex-1 flex-col">
          <address className="flex-1">
            {`${contact?.firstName} ${contact?.lastName}`}
            <br />
            {contact?.street}
            <br />
            {`${contact?.zip} ${contact?.city}`}
            <br />
            <a href="#">{contact?.email}</a>
          </address>
        </div>
        <div className="flex flex-1 flex-col items-end">
          <span>{contact?.bank}</span>
          <span>{`IBAN: ${contact?.iban}`}</span>
          <span>{`BIC: ${contact?.bic}`}</span>
          <span>{`USt-ID: ${contact?.vat}`}</span>
        </div>
      </footer>
    </main >
  );
};

export default InvoicePage;
