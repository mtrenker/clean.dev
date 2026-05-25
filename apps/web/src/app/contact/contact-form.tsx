'use client';

import { useActionState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/site/public-design';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactEmail, type ContactFormState } from './actions';

const initialState: ContactFormState = {};
const fieldClass = 'border-[var(--site-rule)] bg-[var(--site-bg)] text-[var(--site-ink)] focus:border-[var(--site-rust)] focus:ring-[var(--site-rust)]';

export const ContactForm: React.FC = () => {
  const intl = useIntl();
  const [state, action, isPending] = useActionState(sendContactEmail, initialState);

  if (state.success) {
    return (
      <Card className="p-8 text-center">
        <p className="text-2xl font-medium text-[var(--site-ink)]">{intl.formatMessage({ id: 'contact.success.heading' })}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--site-ink-sec)]">
          {intl.formatMessage({ id: 'contact.success.body' })}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <form action={action} noValidate className="space-y-6">
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
            className={fieldClass}
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
            className={fieldClass}
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
            rows={7}
            hasError={!!state.fieldErrors?.message}
            disabled={isPending}
            className={fieldClass}
          />
        </FormField>

        {state.error && (
          <p role="alert" className="text-sm text-red-400">{state.error}</p>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[3px] bg-[var(--site-rust)] px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-[var(--site-panel-deep)] transition hover:bg-[var(--site-ink)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? intl.formatMessage({ id: 'contact.form.submitting' }) : intl.formatMessage({ id: 'contact.form.submit' })}
          </button>
          <p className="text-xs leading-6 text-[var(--site-ink-mute)]">
            <FormattedMessage
              id="contact.form.privacy"
              values={{
                link: (
                  <Link
                    href="/privacy"
                    className="text-[var(--site-rust)] underline underline-offset-2 transition-colors hover:text-[var(--site-ink)]"
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
