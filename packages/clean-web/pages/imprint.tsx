import clsx from 'clsx';
import type { NextPage } from 'next';

const Contact: NextPage = () => (
  <main className={clsx([
    'prose prose-invert container mx-auto max-w-md p-4',
  ])}
  >
    <h1 className="text-3xl font-semibold uppercase">Imprint</h1>

    <h2>Information according to § 5 TMG</h2>

    <address>
      Martin Trenker
      <br />
      Philipp-Loewenfeld-str. 63
      <br />
      80339 Munich
      <br />
      Germany
      <br />
    </address>

    <h3>Contact</h3>
    <address>
      E-Mail: info@clean.dev
    </address>

    <p>Umsatzsteuer-Identifikationsnummer (VAT): DE262621028</p>

    <h3>Responsible for the Content</h3>
    <p>Martin Trenker</p>
  </main>
);

export async function getStaticProps () {
  return { props: {} };
}

export default Contact;
