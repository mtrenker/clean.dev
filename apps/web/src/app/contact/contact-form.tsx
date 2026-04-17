'use client';

import { useActionState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { sendContactEmail, type ContactFormState } from './actions';

const initialState: ContactFormState = {};

export const ContactForm: React.FC = () => {
  const intl = useIntl();
  const [state, action, isPending] = useActionState(sendContactEmail, initialState);

  if (state.success) {
    return (
      <Card>
        <div className="space-y-2 py-4 text-center">
          <p className="text-lg font-medium text-foreground">{intl.formatMessage({ id: 'contact.success.heading' })}</p>
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({ id: 'contact.success.body' })}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form action={action} noValidate className="space-y-6">
        {/* Honeypot — hidden from real users, bots fill it in */}
        <input
          type="text"
          name="website"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        />

        <FormField
          label={intl.formatMessage({ id: 'contact.form.name' })}
          htmlFor="name"
          required
          error={state.fieldErrors?.name}
        >
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            hasError={!!state.fieldErrors?.name}
            disabled={isPending}
          />
        </FormField>

        <FormField
          label={intl.formatMessage({ id: 'contact.form.email' })}
          htmlFor="email"
          required
          error={state.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            hasError={!!state.fieldErrors?.email}
            disabled={isPending}
          />
        </FormField>

        <FormField
          label={intl.formatMessage({ id: 'contact.form.message' })}
          htmlFor="message"
          required
          error={state.fieldErrors?.message}
        >
          <Textarea
            id="message"
            name="message"
            rows={6}
            hasError={!!state.fieldErrors?.message}
            disabled={isPending}
          />
        </FormField>

        {state.error && (
          <p role="alert" className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="space-y-4">
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? intl.formatMessage({ id: 'contact.form.submitting' }) : intl.formatMessage({ id: 'contact.form.submit' })}
          </Button>
          {/* DSGVO Art. 13 — inline privacy notice required at point of data collection */}
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="contact.form.privacy"
              values={{
                link: (
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2 transition-colors hover:text-accent"
                  >
                    {intl.formatMessage({ id: 'contact.form.privacy.link' })}
                  </Link>
                ),
              }}
            />
          </p>
        </div>
      </form>
    </Card>
  );
};
