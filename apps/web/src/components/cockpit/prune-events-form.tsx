'use client';

/**
 * PruneEventsForm – operator UI for manually pruning raw cockpit events.
 *
 * Operators can prune by:
 *   • A specific sequence number (delete events with sequence ≤ N)
 *   • An age cutoff (delete events older than N days)
 *
 * The form calls the `pruneProjectEventsAction` server action and displays
 * a confirmation summary on success.  It requires an active admin session
 * (enforced server-side by the action).
 */

import React, { useActionState, useRef } from 'react';
import { pruneProjectEventsAction } from '@/app/cockpit/actions';
import type { PruneProjectEventsResult } from '@/app/cockpit/actions';

// ── State ──────────────────────────────────────────────────────────────────────

type FormState =
  | { status: 'idle' }
  | { status: 'success'; result: PruneProjectEventsResult }
  | { status: 'error'; message: string };

const initialState: FormState = { status: 'idle' };

// ── Action wrapper ─────────────────────────────────────────────────────────────

async function formAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const projectId = formData.get('projectId')?.toString() || null;
  const mode = formData.get('mode')?.toString() ?? 'days';
  const reason = formData.get('reason')?.toString() || null;

  try {
    let result: PruneProjectEventsResult;

    if (mode === 'sequence') {
      const seq = parseInt(formData.get('throughSequence')?.toString() ?? '', 10);
      if (isNaN(seq) || seq < 0) {
        return { status: 'error', message: 'Sequence must be a non-negative integer' };
      }
      result = await pruneProjectEventsAction({ projectId, throughSequence: seq, reason });
    } else {
      const days = parseInt(formData.get('days')?.toString() ?? '', 10);
      if (isNaN(days) || days < 1) {
        return { status: 'error', message: 'Days must be at least 1' };
      }
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      result = await pruneProjectEventsAction({ projectId, occurredBefore: cutoff, reason });
    }

    return { status: 'success', result };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Pruning failed — check server logs',
    };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface PruneEventsFormProps {
  /** Pre-fill the project ID field (pass the current project's ID). */
  projectId?: string;
  /** Pre-fill a suggested sequence based on the current projection. */
  suggestedThroughSequence?: number;
}

export const PruneEventsForm: React.FC<PruneEventsFormProps> = ({
  projectId,
  suggestedThroughSequence,
}) => {
  const [state, dispatch, isPending] = useActionState(formAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = React.useState<'days' | 'sequence'>('days');

  // Reset the form after a successful prune so operators can run another.
  React.useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Prune raw events</h3>
      <p className="text-xs text-muted-foreground">
        Removes raw events from the database to reclaim storage. The projected state
        snapshot is <strong>not</strong> affected — only the raw event log is pruned.
        This action is logged to the audit trail.
      </p>

      {state.status === 'success' && (
        <div
          role="status"
          className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
        >
          <strong>Pruned successfully.</strong>{' '}
          {state.result.deletedEventCount.toLocaleString()} event
          {state.result.deletedEventCount !== 1 ? 's' : ''} deleted across{' '}
          {state.result.projectsAffected.length} project
          {state.result.projectsAffected.length !== 1 ? 's' : ''}.{' '}
          <span className="text-xs opacity-70">Run ID: {state.result.pruneRunId}</span>
        </div>
      )}

      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          <strong>Error:</strong> {state.message}
        </div>
      )}

      <form ref={formRef} action={dispatch} className="space-y-3">
        {/* Hidden project ID – populated from props */}
        {projectId && (
          <input type="hidden" name="projectId" value={projectId} />
        )}

        {/* Mode toggle */}
        <fieldset className="space-y-1">
          <legend className="text-xs font-medium text-muted-foreground">Prune by</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="days"
                checked={mode === 'days'}
                onChange={() => setMode('days')}
              />
              Age (days)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="sequence"
                checked={mode === 'sequence'}
                onChange={() => setMode('sequence')}
              />
              Sequence number
            </label>
          </div>
        </fieldset>

        {/* Age cutoff */}
        {mode === 'days' && (
          <div className="space-y-1">
            <label htmlFor="prune-days" className="text-xs font-medium text-muted-foreground">
              Delete events older than (days)
            </label>
            <input
              id="prune-days"
              name="days"
              type="number"
              min={1}
              defaultValue={30}
              required
              className="block w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Sequence number */}
        {mode === 'sequence' && (
          <div className="space-y-1">
            <label htmlFor="prune-seq" className="text-xs font-medium text-muted-foreground">
              Delete events with sequence ≤
            </label>
            <input
              id="prune-seq"
              name="throughSequence"
              type="number"
              min={0}
              defaultValue={suggestedThroughSequence ?? 0}
              required
              className="block w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Reason */}
        <div className="space-y-1">
          <label htmlFor="prune-reason" className="text-xs font-medium text-muted-foreground">
            Reason <span className="font-normal">(optional – stored in audit log)</span>
          </label>
          <input
            id="prune-reason"
            name="reason"
            type="text"
            maxLength={200}
            placeholder="e.g. monthly storage cleanup"
            className="block w-full rounded border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Pruning…' : 'Prune events'}
        </button>
      </form>
    </div>
  );
};
