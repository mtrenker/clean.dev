import type { Metadata, NextPage } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Impressum | clean.dev',
  description: 'Legal information and imprint according to German law (§5 TMG)',
};

const ImprintPage: NextPage = () => (
  <main className="bg-background py-12 md:py-16">
    <Container size="narrow" className="px-6">
      <div className="space-y-8">
        {/* Header */}
        <header className="border-b border-border pb-6">
          <Heading as="h1" variant="display" className="mb-2 text-5xl text-foreground">
            Impressum
          </Heading>
          <p className="mt-2 text-sm text-muted-foreground">
            Information according to § 5 TMG (Telemediengesetz)
          </p>
        </header>

        {/* Service Provider Section */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            Angaben gemäß § 5 TMG
          </Heading>
          <Card>
            <address className="space-y-1 not-italic text-muted-foreground">
              <p className="font-semibold text-foreground">Martin Trenker</p>
              <p>Philipp-Loewenfeld-Str. 63</p>
              <p>80339 München</p>
              <p>Deutschland</p>
            </address>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            Kontakt
          </Heading>
          <Card>
            <address className="space-y-2 not-italic text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-medium text-foreground">Kontakt:</span>
                <Link
                  className="text-accent transition-colors hover:underline"
                  href="/contact"
                >
                  Kontaktformular
                </Link>
              </p>
            </address>
          </Card>
        </section>

        {/* Tax Information */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            Umsatzsteuer-ID
          </Heading>
          <Card>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
              </span>
              <br />
              <span className="font-mono text-lg">DE262621028</span>
            </p>
          </Card>
        </section>

        {/* Responsible for Content */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            Verantwortlich für den Inhalt
          </Heading>
          <Card>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Verantwortlich nach § 55 Abs. 2 RStV:
              </span>
              <br />
              Martin Trenker
              <br />
              Philipp-Loewenfeld-Str. 63
              <br />
              80339 München
            </p>
          </Card>
        </section>

        {/* EU Dispute Resolution */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            EU-Streitschlichtung
          </Heading>
          <Card>
            <p className="leading-relaxed text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{' '}
              <a
                className="break-all text-accent transition-colors hover:underline"
                href="https://ec.europa.eu/consumers/odr"
                rel="noopener noreferrer"
                target="_blank"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </Card>
        </section>

        {/* Consumer Dispute Resolution */}
        <section className="space-y-4">
          <Heading as="h2" variant="section" className="text-2xl text-foreground">
            Verbraucherstreitbeilegung
          </Heading>
          <Card>
            <p className="leading-relaxed text-muted-foreground">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
              vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </Card>
        </section>
      </div>
    </Container>
  </main>
);

export default ImprintPage;
