'use client';

import { useActionState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/site/public-design';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { sendContactEmail, type ContactFormState } from './actions';

const initialState: ContactFormState = {};
const fieldClass = 'border-[var(--site-rule)] bg-[var(--site-bg)] text-[var(--site-ink)] focus:border-[var(--site-rust)] focus:ring-[var(--site-rust)] disabled:bg-[var(--site-panel-alt)]';
const labelClass = 'text-[var(--site-ink)]';

const engagementTypes = [
  'embeddedTechnicalLead',
  'solutionsArchitecture',
  'architectureDeliveryAssessment',
  'aiEngineeringAdvisory',
  'seniorImplementationSupport',
  'notSureYet',
] as const;

const engagementTypeValues: Record<typeof engagementTypes[number], string> = {
  embeddedTechnicalLead: 'embedded-technical-lead',
  solutionsArchitecture: 'solutions-architecture',
  architectureDeliveryAssessment: 'architecture-delivery-assessment',
  aiEngineeringAdvisory: 'ai-engineering-advisory',
  seniorImplementationSupport: 'senior-implementation-support',
  notSureYet: 'not-sure-yet',
};

export const ContactForm: React.FC = () => {
  const intl = useIntl();
  const [state, action, isPending] = useActionState(sendContactEmail, initialState);
  const optional = intl.formatMessage({ id: 'contact.form.optional' });
  const optionalLabel = (id: string) => `${intl.formatMessage({ id })} (${optional})`;

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
        <input type="hidden" name="locale" value={intl.locale === 'de' ? 'de' : 'en'} />
        <input
          type="text"
          name="website"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label={intl.formatMessage({ id: 'contact.form.name' })}
            htmlFor="name"
            required
            error={state.fieldErrors?.name}
            labelClassName={labelClass}
          >
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state.values?.name}
              required
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
            labelClassName={labelClass}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values?.email}
              required
              hasError={!!state.fieldErrors?.email}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>
        </div>

        <FormField
          label={intl.formatMessage({ id: 'contact.form.message' })}
          htmlFor="message"
          required
          error={state.fieldErrors?.message}
          labelClassName={labelClass}
        >
          <Textarea
            id="message"
            name="message"
            rows={7}
            defaultValue={state.values?.message}
            required
            hasError={!!state.fieldErrors?.message}
            disabled={isPending}
            className={fieldClass}
          />
        </FormField>

        <div className="grid gap-6 border-t border-dashed border-[var(--site-rule)] pt-6 md:grid-cols-2">
          <FormField
            label={optionalLabel('contact.form.company')}
            htmlFor="company"
            error={state.fieldErrors?.company}
            labelClassName={labelClass}
          >
            <Input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              defaultValue={state.values?.company}
              hasError={!!state.fieldErrors?.company}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>

          <FormField
            label={optionalLabel('contact.form.desiredStartDate')}
            htmlFor="desiredStartDate"
            error={state.fieldErrors?.desiredStartDate}
            labelClassName={labelClass}
          >
            <Input
              id="desiredStartDate"
              name="desiredStartDate"
              type="date"
              defaultValue={state.values?.desiredStartDate}
              hasError={!!state.fieldErrors?.desiredStartDate}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>

          <FormField
            label={optionalLabel('contact.form.expectedDaysPerWeek')}
            htmlFor="expectedDaysPerWeek"
            error={state.fieldErrors?.expectedDaysPerWeek}
            labelClassName={labelClass}
          >
            <Input
              id="expectedDaysPerWeek"
              name="expectedDaysPerWeek"
              type="text"
              inputMode="decimal"
              defaultValue={state.values?.expectedDaysPerWeek}
              hasError={!!state.fieldErrors?.expectedDaysPerWeek}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>

          <FormField
            label={optionalLabel('contact.form.onsiteModel')}
            htmlFor="onsiteModel"
            error={state.fieldErrors?.onsiteModel}
            labelClassName={labelClass}
          >
            <Input
              id="onsiteModel"
              name="onsiteModel"
              type="text"
              defaultValue={state.values?.onsiteModel}
              hasError={!!state.fieldErrors?.onsiteModel}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>

          <FormField
            label={optionalLabel('contact.form.engagementType')}
            htmlFor="engagementType"
            error={state.fieldErrors?.engagementType}
            labelClassName={labelClass}
          >
            <Select
              id="engagementType"
              name="engagementType"
              defaultValue={state.values?.engagementType ?? ''}
              hasError={!!state.fieldErrors?.engagementType}
              disabled={isPending}
              className={fieldClass}
            >
              <option value="">{intl.formatMessage({ id: 'contact.form.engagementType.empty' })}</option>
              {engagementTypes.map((type) => (
                <option key={type} value={engagementTypeValues[type]}>
                  {intl.formatMessage({ id: `contact.form.engagementType.${type}` })}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label={optionalLabel('contact.form.budgetRange')}
            htmlFor="budgetRange"
            error={state.fieldErrors?.budgetRange}
            labelClassName={labelClass}
          >
            <Input
              id="budgetRange"
              name="budgetRange"
              type="text"
              defaultValue={state.values?.budgetRange}
              hasError={!!state.fieldErrors?.budgetRange}
              disabled={isPending}
              className={fieldClass}
            />
          </FormField>
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-400">{state.error}</p>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[3px] bg-[var(--site-rust)] px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-[var(--site-bg)] transition hover:bg-[var(--site-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-bg)] disabled:cursor-not-allowed disabled:opacity-60"
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
