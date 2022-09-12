import clsx from 'clsx';
import type { NextPage } from 'next';

const Contact: NextPage = () => (
  <main className={clsx([
    'container mx-auto max-w-md p-4',
  ])}
  >
    <h1 className="text-3xl font-semibold uppercase">Contact</h1>
    <div className="mx-auto my-4 rounded border border-zinc-700 bg-zinc-800 p-4">
      <p>This website is the online portfolio of:</p>
      <address>
        Martin Trenker
        <br />
        Philipp-Loewenfeld-Str. 63
        <br />
        80339 München
      </address>
    </div>
  </main>
);

export async function getStaticProps () {
  return {
    props: {},
  };
}

export default Contact;
