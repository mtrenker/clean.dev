'use client';

/**
 * ProjectConfigForm — admin UI for per-project observation, telemetry and
 * worktree-root configuration.
 *
 * Wires the Task 005 server actions:
 *   • `updateProjectConfigAction({ projectId, observation, telemetry, worktreeRootPath })`
 *
 * Submitting the form posts the merged config to the server. After a
 * successful update the page is refreshed so the operator can see that the
 * change has landed; the daemon will pick it up on its next observation cycle.
 */

import React, { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ProjectObservationConfig,
  TelemetryProfile,
  WorktreeGroupingMode,
} from '@cleandev/cockpit-protocol';
import { updateProjectConfigAction } from '@/app/cockpit/actions';
import { Button, FormField, Input, Select, Badge } from '@/components/ui';
import { ConsolePanel } from '../console-panel';

// ── Defaults (mirror packages/cockpit-protocol/src/config.ts presets) ─────────

const DEFAULT_OBSERVATION: ProjectObservationConfig = {
  alias: null,
  staleAfterMs: 60_000,
  includeArchived: true,
  worktrees: {
    nameTemplate: '{branch}',
    groupBy: 'branch',
    groupNameTemplate: '{group}',
  },
};

const DEFAULT_TELEMETRY: TelemetryProfile = {
  worktreePath: 'relative',
  repoRootPath: 'off',
  git: 'full',
  progressText: false,
  usage: true,
  planText: true,
  taskDescription: true,
};

const GROUPING_MODES: WorktreeGroupingMode[] = [
  'branch',
  'directory',
  'device',
  'custom',
];

const TELEMETRY_PATH_MODES = ['off', 'basename', 'relative', 'full'] as const;
const TELEMETRY_GIT_MODES = ['off', 'branch-only', 'full'] as const;

// ── Form state ─────────────────────────────────────────────────────────────────

type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const initialState: FormState = { status: 'idle' };

interface FormPayload {
  projectId: string;
  worktreeRootPath: string | null;
  observation: ProjectObservationConfig;
  telemetry: TelemetryProfile;
}

async function submit(_prev: FormState, payload: FormPayload): Promise<FormState> {
  try {
    await updateProjectConfigAction({
      projectId: payload.projectId,
      worktreeRootPath: payload.worktreeRootPath,
      observation: payload.observation,
      telemetry: payload.telemetry,
    });
    return { status: 'success' };
  } catch (err) {
    return {
      status: 'error',
      message:
        err instanceof Error ? err.message : 'Update failed — see server logs',
    };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface ProjectConfigFormProps {
  projectId: string;
  initialWorktreeRootPath?: string | null;
  initialObservation?: ProjectObservationConfig | null;
  initialTelemetry?: TelemetryProfile | null;
}

export const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({
  projectId,
  initialWorktreeRootPath,
  initialObservation,
  initialTelemetry,
}) => {
  const router = useRouter();
  const [state, dispatch] = useActionState<FormState, FormPayload>(
    submit,
    initialState,
  );
  const [pending, startTransition] = useTransition();

  // Hold the entire form locally so we can validate before submission.
  const obs0 = initialObservation ?? DEFAULT_OBSERVATION;
  const tel0 = initialTelemetry ?? DEFAULT_TELEMETRY;

  const [worktreeRootPath, setWorktreeRootPath] = useState(
    initialWorktreeRootPath ?? '',
  );
  const [alias, setAlias] = useState(obs0.alias ?? '');
  const [staleAfterMs, setStaleAfterMs] = useState(
    obs0.staleAfterMs ?? DEFAULT_OBSERVATION.staleAfterMs,
  );
  const [includeArchived, setIncludeArchived] = useState(
    obs0.includeArchived ?? true,
  );
  const [nameTemplate, setNameTemplate] = useState(
    obs0.worktrees?.nameTemplate ?? '{branch}',
  );
  const [groupBy, setGroupBy] = useState<WorktreeGroupingMode>(
    obs0.worktrees?.groupBy ?? 'branch',
  );
  const [groupNameTemplate, setGroupNameTemplate] = useState(
    obs0.worktrees?.groupNameTemplate ?? '{group}',
  );

  const [telWorktreePath, setTelWorktreePath] = useState<
    (typeof TELEMETRY_PATH_MODES)[number]
  >(tel0.worktreePath);
  const [telRepoRootPath, setTelRepoRootPath] = useState<
    (typeof TELEMETRY_PATH_MODES)[number]
  >(tel0.repoRootPath);
  const [telGit, setTelGit] = useState<(typeof TELEMETRY_GIT_MODES)[number]>(
    tel0.git,
  );
  const [telProgressText, setTelProgressText] = useState(tel0.progressText);
  const [telUsage, setTelUsage] = useState(tel0.usage);
  const [telPlanText, setTelPlanText] = useState(tel0.planText);
  const [telTaskDescription, setTelTaskDescription] = useState(
    tel0.taskDescription,
  );

  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    const stale = Number(staleAfterMs);
    if (!Number.isFinite(stale) || stale <= 0 || stale > 86_400_000) {
      setLocalError(
        'Stale-after must be a positive number of milliseconds, ≤ 86,400,000.',
      );
      return;
    }
    if (!nameTemplate.trim()) {
      setLocalError('Worktree name template is required.');
      return;
    }
    if (!groupNameTemplate.trim()) {
      setLocalError('Group name template is required.');
      return;
    }

    const payload: FormPayload = {
      projectId,
      worktreeRootPath: worktreeRootPath.trim() === '' ? null : worktreeRootPath.trim(),
      observation: {
        alias: alias.trim() === '' ? null : alias.trim(),
        staleAfterMs: stale,
        includeArchived,
        worktrees: {
          nameTemplate: nameTemplate.trim(),
          groupBy,
          groupNameTemplate: groupNameTemplate.trim(),
        },
      },
      telemetry: {
        worktreePath: telWorktreePath,
        repoRootPath: telRepoRootPath,
        git: telGit,
        progressText: telProgressText,
        usage: telUsage,
        planText: telPlanText,
        taskDescription: telTaskDescription,
      },
    };

    startTransition(() => {
      dispatch(payload);
    });
  }

  // After a successful save, refresh the route so the new config is visible
  // on subsequent renders (the daemon picks it up on its next observation).
  React.useEffect(() => {
    if (state.status === 'success') {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Status banners ─────────────────────────────────────────── */}
      {state.status === 'success' && (
        <div
          role="status"
          className="rounded-sm border border-success/40 bg-success/10 px-3 py-2 font-mono text-xs text-success"
        >
          ✓ Configuration saved. The next daemon observation will pick up the
          new patterns and re-group worktrees on the project overview.
        </div>
      )}
      {(state.status === 'error' || localError) && (
        <div
          role="alert"
          className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
        >
          ✗ {localError ?? (state.status === 'error' ? state.message : '')}
        </div>
      )}

      {/* ── Repo root + alias ──────────────────────────────────────── */}
      <ConsolePanel
        title="Project paths & alias"
        command="cockpit project edit --root --alias"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Worktree root path"
            htmlFor="cfg-worktree-root"
          >
            <Input
              id="cfg-worktree-root"
              name="worktreeRootPath"
              type="text"
              placeholder="/abs/path/to/worktrees (optional)"
              value={worktreeRootPath}
              onChange={(e) => setWorktreeRootPath(e.target.value)}
              maxLength={2_000}
            />
          </FormField>
          <FormField label="Alias" htmlFor="cfg-alias">
            <Input
              id="cfg-alias"
              name="alias"
              type="text"
              placeholder="Friendly name shown in dashboards"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={512}
            />
          </FormField>
        </div>
      </ConsolePanel>

      {/* ── Observation config ─────────────────────────────────────── */}
      <ConsolePanel
        title="Observation"
        command="cockpit project edit --observation"
        meta={<Badge variant="muted">Task 005 API</Badge>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Stale-after (ms)"
            htmlFor="cfg-stale-after"
          >
            <Input
              id="cfg-stale-after"
              type="number"
              min={1}
              max={86_400_000}
              step={1_000}
              value={staleAfterMs}
              onChange={(e) => setStaleAfterMs(Number(e.target.value))}
            />
          </FormField>
          <FormField
            label="Include archived"
            htmlFor="cfg-include-archived"
          >
            <label className="flex items-center gap-2 font-mono text-sm text-foreground">
              <input
                id="cfg-include-archived"
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border bg-background"
              />
              Include archived plans/tasks in observation
            </label>
          </FormField>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField
            label="Worktree name template"
            htmlFor="cfg-name-template"
          >
            <Input
              id="cfg-name-template"
              type="text"
              required
              maxLength={256}
              value={nameTemplate}
              onChange={(e) => setNameTemplate(e.target.value)}
              placeholder="{branch}"
            />
          </FormField>
          <FormField label="Group by" htmlFor="cfg-group-by">
            <Select
              id="cfg-group-by"
              value={groupBy}
              onChange={(e) =>
                setGroupBy(e.target.value as WorktreeGroupingMode)
              }
            >
              {GROUPING_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Group name template"
            htmlFor="cfg-group-template"
          >
            <Input
              id="cfg-group-template"
              type="text"
              required
              maxLength={256}
              value={groupNameTemplate}
              onChange={(e) => setGroupNameTemplate(e.target.value)}
              placeholder="{group}"
            />
          </FormField>
        </div>

        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Templates accept tokens like <code className="text-accent">{'{branch}'}</code>
          , <code className="text-accent">{'{group}'}</code>,
          <code className="text-accent">{'{device}'}</code>. Examples: canonical
          worktrees use <code className="text-accent">{'{branch}'}</code>; scratch
          areas typically use{' '}
          <code className="text-accent">scratch/{'{slug}'}</code>; multi-feature
          projects can group by <code className="text-accent">directory</code>.
        </p>
      </ConsolePanel>

      {/* ── Telemetry profile ──────────────────────────────────────── */}
      <ConsolePanel
        title="Telemetry profile"
        command="cockpit project edit --telemetry"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField label="Worktree path mode" htmlFor="cfg-tel-wt">
            <Select
              id="cfg-tel-wt"
              value={telWorktreePath}
              onChange={(e) =>
                setTelWorktreePath(
                  e.target.value as (typeof TELEMETRY_PATH_MODES)[number],
                )
              }
            >
              {TELEMETRY_PATH_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Repo-root path mode" htmlFor="cfg-tel-repo">
            <Select
              id="cfg-tel-repo"
              value={telRepoRootPath}
              onChange={(e) =>
                setTelRepoRootPath(
                  e.target.value as (typeof TELEMETRY_PATH_MODES)[number],
                )
              }
            >
              {TELEMETRY_PATH_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Git mode" htmlFor="cfg-tel-git">
            <Select
              id="cfg-tel-git"
              value={telGit}
              onChange={(e) =>
                setTelGit(
                  e.target.value as (typeof TELEMETRY_GIT_MODES)[number],
                )
              }
            >
              {TELEMETRY_GIT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <fieldset className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <legend className="sr-only">Telemetry toggles</legend>
          <ToggleField
            label="Send progress text"
            id="cfg-tel-progress"
            checked={telProgressText}
            onChange={setTelProgressText}
          />
          <ToggleField
            label="Send token usage"
            id="cfg-tel-usage"
            checked={telUsage}
            onChange={setTelUsage}
          />
          <ToggleField
            label="Send plan text"
            id="cfg-tel-plan"
            checked={telPlanText}
            onChange={setTelPlanText}
          />
          <ToggleField
            label="Send task descriptions"
            id="cfg-tel-task"
            checked={telTaskDescription}
            onChange={setTelTaskDescription}
          />
        </fieldset>
      </ConsolePanel>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
        <p className="font-mono text-xs text-muted-foreground">
          Changes are stored on the server and merged into the daemon config
          on its next observation cycle. Local-only overrides set on the
          daemon take precedence.
        </p>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save configuration'}
        </Button>
      </div>
    </form>
  );
};

interface ToggleFieldProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  id,
  checked,
  onChange,
}) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-center gap-2 rounded-sm border border-border/60 bg-background/60 px-3 py-2 font-mono text-sm text-foreground hover:bg-background/80"
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded-sm border-border bg-background"
    />
    {label}
  </label>
);
