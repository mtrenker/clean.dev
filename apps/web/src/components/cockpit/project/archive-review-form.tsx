'use client';

/**
 * ArchiveReviewForm — admin-only verdict form for archived tasks and plans.
 *
 * Renders three big console-style verdict buttons (`Mark reviewed`, `Dismiss`,
 * `Re-open`) plus an optional notes textarea.  Submitting calls the server
 * action and refreshes the route so the projected state mirror updates in
 * place.
 *
 * Used in:
 *   • `/cockpit/[projectId]/tasks/[taskId]` (when the task is archived)
 *   • `/cockpit/[projectId]/plans/[planId]` (when the plan is archived)
 */
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import {
  setTaskArchiveReviewAction,
  setPlanArchiveReviewAction,
} from '@/app/cockpit/actions';

export type ArchiveReviewTarget =
  | { kind: 'task'; projectId: string; taskId: string }
  | { kind: 'plan'; projectId: string; planId: string };

export type ArchiveReviewStatus = 'pending' | 'reviewed' | 'dismissed';

interface ArchiveReviewFormProps {
  target: ArchiveReviewTarget;
  currentStatus: ArchiveReviewStatus;
  currentNotes?: string | null;
  reviewedAt?: string | null;
}

const STATUS_BADGE: Record<ArchiveReviewStatus, React.ComponentProps<typeof Badge>['variant']> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'muted',
};

const STATUS_LABEL: Record<ArchiveReviewStatus, string> = {
  pending: 'pending',
  reviewed: 'reviewed',
  dismissed: 'dismissed',
};

export const ArchiveReviewForm: React.FC<ArchiveReviewFormProps> = ({
  target,
  currentStatus,
  currentNotes,
  reviewedAt,
}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(currentNotes ?? '');
  const [lastVerdict, setLastVerdict] = useState<ArchiveReviewStatus | null>(null);

  const submit = (status: ArchiveReviewStatus) => {
    setError(null);
    setLastVerdict(status);
    startTransition(async () => {
      try {
        if (target.kind === 'task') {
          await setTaskArchiveReviewAction({
            projectId: target.projectId,
            taskId: target.taskId,
            reviewStatus: status,
            reviewNotes: notes.trim() ? notes.trim() : null,
          });
        } else {
          await setPlanArchiveReviewAction({
            projectId: target.projectId,
            planId: target.planId,
            reviewStatus: status,
            reviewNotes: notes.trim() ? notes.trim() : null,
          });
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update review status');
      }
    });
  };

  const subjectLabel = target.kind === 'task' ? 'task' : 'plan';

  return (
    <ConsolePanel
      title="Archive review"
      command={
        target.kind === 'task'
          ? 'cockpit archive review --task'
          : 'cockpit archive review --plan'
      }
      meta={<Badge variant={STATUS_BADGE[currentStatus]}>{STATUS_LABEL[currentStatus]}</Badge>}
    >
      <div className="space-y-4">
        <p className="font-mono text-xs text-muted-foreground">
          Mark this archived {subjectLabel} as reviewed once you have read the
          handover and are satisfied with what shipped, or dismiss it if no
          follow-up is needed.
          {reviewedAt && (
            <span className="ml-1 text-foreground/70">
              Last verdict recorded {new Date(reviewedAt).toISOString()}.
            </span>
          )}
        </p>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Review notes
            <span className="ml-2 text-muted-foreground/60 normal-case tracking-normal">
              (optional, max 4000 chars)
            </span>
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            maxLength={4_000}
            disabled={pending}
            className="mt-1 block w-full rounded-sm border border-border/60 bg-background/70 px-3 py-2 font-mono text-xs leading-5 text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
            placeholder="Why are you marking this as reviewed / dismissed?"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={pending}
            onClick={() => submit('reviewed')}
          >
            {pending && lastVerdict === 'reviewed' ? '…' : '✓'} Mark reviewed
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => submit('dismissed')}
          >
            {pending && lastVerdict === 'dismissed' ? '…' : '✕'} Dismiss
          </Button>
          {currentStatus !== 'pending' && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => submit('pending')}
            >
              {pending && lastVerdict === 'pending' ? '…' : '↺'} Re-open
            </Button>
          )}
        </div>
        {error && (
          <p className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </ConsolePanel>
  );
};
