import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useGetProjectWithTrackingsQuery, useMeQuery } from '../../../graphql/generated';
import { differenceInMinutes } from 'date-fns';

const formatPrice = (number: number) => new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(number);

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectWithTrackingsQuery({
    variables: {
      id: id as string,
      date: '2022-10',
    },
  });
  const { data: userData } = useMeQuery();
  const project = data?.project;

  const categories = project?.trackings.reduce((acc, tracking) => {
    const category = tracking.category ?? 'Sonstiges';
    if (acc[category]) {
      acc[category] += differenceInMinutes(new Date(tracking.endTime ?? ''), new Date(tracking.startTime)) / 60;
    } else {
      acc[category] = differenceInMinutes(new Date(tracking.endTime ?? ''), new Date(tracking.startTime)) / 60;
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

  return (
    <main className="container mx-auto grid grid-rows-[max-content_max-content_1fr_max-content] gap-10 print:h-[105vh]">
      <header className="mt-14">
        <h2 className="text-center text-4xl">Martin Trenker</h2>
        <h3 className="text-center text-2xl">Software Entwicklung</h3>
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
          <span>Rechnungsdatum: 01.1.1970</span>
          <span>Leistungszeitraum: MONAT JAHR</span>
          <span className="font-bold">Rechnungsnummer: 123456789</span>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-3xl">Rechnung</h4>
        <h3 className="mb-4 text-xl">Project Name</h3>
        <p className="flex flex-col gap-4">
          <span>Sehr geehrte Damen und Herren,</span>
          <span>hiermit erlaube ich mir Ihnen folgende Leistungen in Rechnung zu stellen:</span>
        </p>
        <table className="my-10 w-full">
          <thead>
            <tr className="bg-stone-100">
              <th className="text-start">Pos</th>
              <th className="text-start">Bezeichnung</th>
              <th className="text-end">Menge</th>
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
                  <td className="text-start">Audit</td>
                  <td className="text-end">{hours}</td>
                  <td className="text-end">19%</td>
                  <td className="text-end">{formatPrice(rate ?? 0)}</td>
                  <td className="text-end">{formatPrice(hours * (rate ?? 0)) }</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mb-4 flex justify-end">
          <table className="w-1/3">
            <tbody>
              <tr>
                <td>Summe netto</td>
                <td className="text-end">{formatPrice(total)}</td>
              </tr>
              <tr>
                <td>MwSt. 19%</td>
                <td className="text-end">{formatPrice(tax)}</td>
              </tr>
              <tr className="border-b-4 border-double border-black dark:border-white">
                <td className="font-bold">Gesamt</td>
                <td className="text-end font-bold">{formatPrice(totalPlusTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Bitte zahlen Sie den Betrag von
          {' '}
          <span className="font-bold">{formatPrice(totalPlusTax)}</span>
          {' '}
          innerhalb von 30 Tagen auf das unten angegebene Konto.
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
    </main>
  );
};

export default InvoicePage;
