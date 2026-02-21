import type { Metadata, NextPage } from 'next';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact | clean.dev',
  description: 'Send a message to Martin Trenker',
};

const ContactPage: NextPage = () => (
  <main className="bg-background py-12 md:py-16">
    <Container size="narrow" className="px-6">
      <div className="space-y-8">
        <header className="border-b border-border pb-6">
          <Heading as="h1" variant="display" className="mb-2 text-5xl text-foreground">
            Contact
          </Heading>
          <p className="mt-2 text-sm text-muted-foreground">
            Send a message and I will get back to you directly.
          </p>
        </header>

        <ContactForm />
      </div>
    </Container>
  </main>
);

export default ContactPage;
