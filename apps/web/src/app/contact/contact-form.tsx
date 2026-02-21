'use client';

import { useActionState } from 'react';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { sendContactEmail, type ContactFormState } from './actions';

const initialState: ContactFormState = {};

export const ContactForm: React.FC = () => {
  const [state, action, isPending] = useActionState(sendContactEmail, initialState);

  if (state.success) {
    return (
      <Card>
        <div className="space-y-2 py-4 text-center">
          <p className="text-lg font-medium text-foreground">Message sent.</p>
          <p className="text-sm text-muted-foreground">
            Thank you for reaching out. I will reply to your email shortly.
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
          label="Name"
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
          label="Email"
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
          label="Message"
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
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
};
