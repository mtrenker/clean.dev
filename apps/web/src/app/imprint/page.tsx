import type { Metadata, NextPage } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | clean.dev',
  description: 'Legal information and imprint according to German law (§5 TMG)',
};

const ImprintPage: NextPage = () => (
  <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Impressum
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Information according to § 5 TMG (Telemediengesetz)
        </p>
      </header>

      {/* Service Provider Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Angaben gemäß § 5 TMG
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <address className="space-y-1 not-italic text-gray-700">
            <p className="font-semibold text-gray-900">Martin Trenker</p>
            <p>Philipp-Loewenfeld-Str. 63</p>
            <p>80339 München</p>
            <p>Deutschland</p>
          </address>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Kontakt
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <address className="space-y-2 not-italic text-gray-700">
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-900">E-Mail:</span>
              <a
                className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                href="mailto:info@clean.dev"
              >
                info@clean.dev
              </a>
            </p>
          </address>
        </div>
      </section>

      {/* Tax Information */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Umsatzsteuer-ID
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
            </span>
            <br />
            <span className="font-mono text-lg">DE262621028</span>
          </p>
        </div>
      </section>

      {/* Responsible for Content */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Verantwortlich für den Inhalt
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">
              Verantwortlich nach § 55 Abs. 2 RStV:
            </span>
            <br />
            Martin Trenker
            <br />
            Philipp-Loewenfeld-Str. 63
            <br />
            80339 München
          </p>
        </div>
      </section>

      {/* EU Dispute Resolution */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          EU-Streitschlichtung
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="leading-relaxed text-gray-700">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{' '}
            <a
              className="break-all text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              href="https://ec.europa.eu/consumers/odr"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            <br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
        </div>
      </section>

      {/* Consumer Dispute Resolution */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Verbraucherstreitbeilegung
        </h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="leading-relaxed text-gray-700">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </div>
  </main>
);

export default ImprintPage;
