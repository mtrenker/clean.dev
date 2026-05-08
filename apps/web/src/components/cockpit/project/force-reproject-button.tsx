'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { forceReprojectAction } from '@/app/cockpit/actions';

interface ForceReprojectButtonProps {
  projectId: string;
}

/**
 * Admin-only button that triggers a full re-projection of a project.
 *
 * Calls the `forceReprojectAction` server action, which resets the projection
 * checkpoint to sequence 0 and marks the project dirty so the background
 * projector re-folds all events on its next cycle.
 *
 * After the action completes the page is refreshed so the new projection
 * status (raw vs projected sequence) is reflected immediately.
 */
export function ForceReprojectButton({ projectId }: ForceReprojectButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { ok: true; triggeredAt: string } | { ok: false; error: string } | null
  >(null);

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await forceReprojectAction(projectId);
        setResult({ ok: true, triggeredAt: res.triggeredAt });
        // Refresh the server component tree so projection status updates.
        router.refresh();
      } catch (err) {
        setResult({ ok: false, error: String(err) });
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex items-center gap-2 rounded-sm border border-border bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? '⟳ Re-projecting…' : '↺ Force re-project'}
      </button>

      {result && (
        <p
          className={`font-mono text-xs ${
            result.ok ? 'text-success-foreground' : 'text-destructive'
          }`}
          role="status"
          aria-live="polite"
        >
          {result.ok
            ? `✓ Checkpoint reset at ${new Date(result.triggeredAt).toLocaleTimeString()}. The projector will re-fold within seconds.`
            : `✗ ${result.error}`}
        </p>
      )}
    </div>
  );
}
