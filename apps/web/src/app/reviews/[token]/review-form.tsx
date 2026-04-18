'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { Button, Card, FormField, Input, Link, Select, Textarea } from '@/components/ui';

interface ReviewFormProps {
  /** Raw token string from the URL – re-sent with the submission for server-side re-verification. */
  token: string;
  callbackPath: string;
  reviewerName: string;
  reviewerEmail: string;
  projectSlug: string;
  linkedInUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

interface ReviewFormValues {
  name: string;
  email: string;
  role: string;
  relationship: string;
  feedback: string;
  consent: boolean;
}

interface ReviewFormErrors {
  name?: string;
  email?: string;
  relationship?: string;
  feedback?: string;
  consent?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export const MIN_FEEDBACK_LENGTH = 40;

/** Maps server-side error codes to user-friendly i18n message IDs. */
const getSubmissionErrorMessageId = (code: string | undefined): string | null => {
  if (code === 'EXPIRED') return 'review.form.error.tokenExpired';
  if (code === 'INVALID_SIGNATURE' || code === 'MALFORMED') return 'review.form.error.tokenInvalid';
  return null;
};

const resolveSubmissionError = (
  intl: IntlShape,
  serverError: string | null,
  code: string | undefined,
): string => {
  const messageId = getSubmissionErrorMessageId(code);
  if (messageId) return intl.formatMessage({ id: messageId });
  return serverError ?? intl.formatMessage({ id: 'review.form.error.submission' });
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
  token,
  callbackPath,
  reviewerName,
  reviewerEmail,
  projectSlug,
  linkedInUser,
}) => {
  const intl = useIntl();

  const initialName = linkedInUser?.name ?? reviewerName;
  const initialEmail = linkedInUser?.email ?? reviewerEmail;

  const [values, setValues] = useState<ReviewFormValues>({
    name: initialName,
    email: initialEmail,
    role: '',
    relationship: '',
    feedback: '',
    consent: false,
  });
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleChange =
    (field: keyof ReviewFormValues) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      const nextValue =
        field === 'consent' && event.target instanceof HTMLInputElement
          ? event.target.checked
          : event.target.value;

      setValues((prev) => ({
        ...prev,
        [field]: nextValue,
      }));

      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    };

  const validate = (): ReviewFormErrors => {
    const nextErrors: ReviewFormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = intl.formatMessage({ id: 'review.form.error.nameRequired' });
    }

    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = intl.formatMessage({ id: 'review.form.error.emailInvalid' });
    }

    if (!values.relationship) {
      nextErrors.relationship = intl.formatMessage({ id: 'review.form.error.relationshipRequired' });
    }

    if (values.feedback.trim().length < MIN_FEEDBACK_LENGTH) {
      nextErrors.feedback = intl.formatMessage(
        { id: 'review.form.error.feedbackLength' },
        { min: MIN_FEEDBACK_LENGTH },
      );
    }

    if (!values.consent) {
      nextErrors.consent = intl.formatMessage({ id: 'review.form.error.consentRequired' });
    }

    return nextErrors;
  };

  const handleLinkedInSignIn = async () => {
    await signIn('linkedin', { redirectTo: callbackPath });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitState('submitting');
    setSubmissionError(null);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role.trim(),
          relationship: values.relationship,
          feedback: values.feedback.trim(),
          consent: values.consent,
        }),
      });

      if (response.ok) {
        setSubmitState('success');
      } else {
        let serverError: string | null = null;
        let errorCode: string | undefined;
        try {
          const data = (await response.json()) as { error?: string; code?: string };
          serverError = data.error ?? null;
          errorCode = data.code;
        } catch {
          // ignore parse error
        }
        setSubmissionError(resolveSubmissionError(intl, serverError, errorCode));
        setSubmitState('error');
      }
    } catch {
      setSubmissionError(intl.formatMessage({ id: 'review.form.error.submission' }));
      setSubmitState('error');
    }
  };

  if (submitState === 'success') {
    return (
      <Card className="border border-accent/40 bg-accent/5">
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {intl.formatMessage({ id: 'review.form.success.title' })}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {intl.formatMessage({ id: 'review.form.success.body' })}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-accent/40 bg-accent/5">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          {intl.formatMessage({ id: 'review.form.linkedin.title' })}
        </h2>
        {linkedInUser ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({ id: 'review.form.linkedin.connected' })}
            </p>
            <div className="flex items-center gap-3 rounded-md border border-accent/30 bg-background/70 p-3">
              {linkedInUser.image ? (
                <img
                  src={linkedInUser.image}
                  alt={linkedInUser.name ?? 'LinkedIn profile'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {(linkedInUser.name ?? initialName ?? 'L').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {linkedInUser.name ?? initialName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {linkedInUser.email ?? initialEmail}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({ id: 'review.form.linkedin.body' })}
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full md:w-auto"
              onClick={() => {
                void handleLinkedInSignIn();
              }}
            >
              {intl.formatMessage({ id: 'review.form.linkedin.cta' })}
            </Button>
            <p className="text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'review.form.linkedin.secondaryPrefix' })}{' '}
              {intl.formatMessage({ id: 'review.form.linkedin.secondaryLink' })}
            </p>
          </>
        )}
      </Card>

      <Card>
        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label={intl.formatMessage({ id: 'review.form.name' })}
              htmlFor="reviewer-name"
              required
              error={errors.name}
            >
              <Input
                id="reviewer-name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={handleChange('name')}
                hasError={!!errors.name}
              />
            </FormField>

            <FormField
              label={intl.formatMessage({ id: 'review.form.email' })}
              htmlFor="reviewer-email"
              required
              error={errors.email}
            >
              <Input
                id="reviewer-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange('email')}
                hasError={!!errors.email}
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label={intl.formatMessage({ id: 'review.form.role' })}
              htmlFor="reviewer-role"
            >
              <Input
                id="reviewer-role"
                name="role"
                value={values.role}
                onChange={handleChange('role')}
                placeholder={intl.formatMessage({ id: 'review.form.role.placeholder' })}
              />
            </FormField>

            <FormField
              label={intl.formatMessage({ id: 'review.form.relationship' })}
              htmlFor="reviewer-relationship"
              required
              error={errors.relationship}
            >
              <Select
                id="reviewer-relationship"
                name="relationship"
                value={values.relationship}
                onChange={handleChange('relationship')}
                hasError={!!errors.relationship}
              >
                <option value="">
                  {intl.formatMessage({ id: 'review.form.relationship.placeholder' })}
                </option>
                <option value="client">
                  {intl.formatMessage({ id: 'review.form.relationship.client' })}
                </option>
                <option value="manager">
                  {intl.formatMessage({ id: 'review.form.relationship.manager' })}
                </option>
                <option value="peer">
                  {intl.formatMessage({ id: 'review.form.relationship.peer' })}
                </option>
              </Select>
            </FormField>
          </div>

          <FormField
            label={intl.formatMessage({ id: 'review.form.feedback' })}
            htmlFor="reviewer-feedback"
            required
            error={errors.feedback}
          >
            <Textarea
              id="reviewer-feedback"
              name="feedback"
              rows={7}
              value={values.feedback}
              onChange={handleChange('feedback')}
              hasError={!!errors.feedback}
              placeholder={intl.formatMessage({ id: 'review.form.feedback.placeholder' })}
            />
          </FormField>

          <div>
            <label className="flex items-start gap-3 text-sm text-foreground" htmlFor="review-consent">
              <Input
                id="review-consent"
                name="consent"
                type="checkbox"
                checked={values.consent}
                onChange={handleChange('consent')}
                className="mt-0.5 !h-4 !w-4 shrink-0 rounded border-border p-0"
                hasError={!!errors.consent}
              />
              <span>{intl.formatMessage({ id: 'review.form.consent' })}</span>
            </label>
            <p className="mt-1 pl-7 text-xs text-muted-foreground">
              <FormattedMessage
                id="review.form.consent.privacyNote"
                values={{
                  privacyLink: (chunks: React.ReactNode) => (
                    <Link href="/privacy" variant="inline">
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </p>
            {errors.consent && (
              <p role="alert" className="mt-2 text-sm text-destructive">{errors.consent}</p>
            )}
          </div>

          {submitState === 'error' && submissionError && (
            <p role="alert" className="text-sm text-destructive">{submissionError}</p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={submitState === 'submitting'}
            >
              {submitState === 'submitting'
                ? intl.formatMessage({ id: 'review.form.submitting' })
                : intl.formatMessage({ id: 'review.form.submit' })}
            </Button>
            <p className="text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'review.form.privacyHint' })}
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

