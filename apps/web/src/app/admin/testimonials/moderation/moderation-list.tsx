'use client';

import React, { useState } from 'react';

type ModerateAction = 'approve' | 'keep_private' | 'decline';

interface Submission {
  id: string;
  token: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  answers: Record<string, string>;
  submitted_at: string;
  public_with_name: boolean;
  public_anonymous: boolean;
}

const QUESTION_LABELS: Record<string, string> = {
  q1: 'In what context did we work together?',
  q2: 'What specific challenge or problem were we working on?',
  q3: 'What was the outcome or result of the work?',
  q4: 'How would you describe the collaboration and communication?',
  q5: 'Would you recommend this consultant for this type of work, and if so, to whom?',
  q6: 'Anything else you would like to add?',
};

export const ModerationList: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const handleAction = async (token: string, action: ModerateAction) => {
    setPending((p) => ({ ...p, [token]: true }));
    setError((e) => ({ ...e, [token]: '' }));

    try {
      const response = await fetch(`/api/testimonials/${token}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const json = await response.json() as { error?: string };
        setError((e) => ({ ...e, [token]: json.error ?? 'Action failed' }));
        return;
      }

      const actionLabel = action === 'approve' ? 'approved' : action === 'decline' ? 'declined' : 'kept private';
      setStatuses((s) => ({ ...s, [token]: actionLabel }));
    } catch {
      setError((e) => ({ ...e, [token]: 'Network error. Please try again.' }));
    } finally {
      setPending((p) => ({ ...p, [token]: false }));
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        No submitted testimonials awaiting moderation.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((sub) => (
        <div key={sub.id} className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">{sub.recipient_name}</p>
              <p className="text-sm capitalize text-muted-foreground">{sub.recipient_role}</p>
              <p className="mt-1 text-sm text-muted-foreground">{sub.engagement_context}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted: {new Date(sub.submitted_at).toLocaleDateString('de-DE')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Consent:{' '}
                {sub.public_with_name
                  ? 'Public with name'
                  : sub.public_anonymous
                  ? 'Public anonymous'
                  : 'Private only'}
              </p>
            </div>

            {statuses[sub.token] ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-800">
                {statuses[sub.token]}
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending[sub.token]}
                  onClick={() => handleAction(sub.token, 'approve')}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={pending[sub.token]}
                  onClick={() => handleAction(sub.token, 'keep_private')}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Keep Private
                </button>
                <button
                  type="button"
                  disabled={pending[sub.token]}
                  onClick={() => handleAction(sub.token, 'decline')}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>

          {error[sub.token] && (
            <p className="mb-3 text-sm text-red-500">{error[sub.token]}</p>
          )}

          <div className="space-y-3">
            {Object.entries(sub.answers).map(([key, value]) => (
              value && (
                <div key={key}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {QUESTION_LABELS[key] ?? key}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{value}</p>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
