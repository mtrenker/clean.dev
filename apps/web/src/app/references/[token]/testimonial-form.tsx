'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';

interface Invitation {
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
}

interface TestimonialFormProps {
  invitation: Invitation;
  token: string;
}

const QUESTIONS = [
  { key: 'q1', label: 'In what context did we work together?' },
  { key: 'q2', label: 'What specific challenge or problem were we working on?' },
  { key: 'q3', label: 'What was the outcome or result of the work?' },
  { key: 'q4', label: 'How would you describe the collaboration and communication?' },
  { key: 'q5', label: 'Would you recommend this consultant for this type of work, and if so, to whom?' },
  { key: 'q6', label: 'Anything else you would like to add?' },
];

export const TestimonialForm: React.FC<TestimonialFormProps> = ({ invitation, token }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState({ publicWithName: false, publicAnonymous: false });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hasSubstantiveAnswer = Object.values(answers).some((v) => v.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSubstantiveAnswer) {
      setError('Please fill in at least one answer before submitting.');
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/testimonials/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, consent }),
      });

      if (response.status === 409) {
        setSubmitted(true);
        return;
      }

      if (!response.ok) {
        const json = await response.json() as { error?: string };
        setError(json.error ?? 'Submission failed. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  if (submitted) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="mb-4 text-4xl">✓</div>
          <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
            Thank you, {invitation.recipient_name}.
          </h2>
          <p className="text-muted-foreground">
            Your feedback has been received. It will be reviewed before any public display.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">Your details</h2>
        <p className="mb-4 text-sm text-muted-foreground">Pre-filled from your invitation — read only.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <p className="mt-1 text-foreground">{invitation.recipient_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <p className="mt-1 capitalize text-foreground">{invitation.recipient_role}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Engagement</p>
            <p className="mt-1 text-foreground">{invitation.engagement_context}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">Your feedback</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          All fields are optional, but please fill in at least one. Prose answers are much more useful than ratings.
        </p>
        <div className="space-y-6">
          {QUESTIONS.map((q) => (
            <FormField key={q.key} label={q.label} htmlFor={q.key}>
              <Textarea
                id={q.key}
                rows={3}
                value={answers[q.key] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                disabled={isPending}
              />
            </FormField>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">Publishing consent</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose how your feedback may be used. If you select neither, your response is stored as a private reference only and will not appear publicly.
        </p>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
              checked={consent.publicWithName}
              onChange={(e) =>
                setConsent((prev) => ({
                  ...prev,
                  publicWithName: e.target.checked,
                  publicAnonymous: e.target.checked ? false : prev.publicAnonymous,
                }))
              }
              disabled={isPending}
            />
            <span className="text-sm text-foreground">
              I consent to this feedback being published publicly on clean.dev with my name and role.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
              checked={consent.publicAnonymous}
              onChange={(e) =>
                setConsent((prev) => ({
                  ...prev,
                  publicAnonymous: e.target.checked,
                  publicWithName: e.target.checked ? false : prev.publicWithName,
                }))
              }
              disabled={isPending}
            />
            <span className="text-sm text-foreground">
              I prefer to remain anonymous — publish feedback without my name.
            </span>
          </label>
        </div>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" variant="primary" disabled={isPending || !hasSubstantiveAnswer}>
        {isPending ? 'Submitting...' : 'Submit feedback'}
      </Button>
    </form>
  );
};
