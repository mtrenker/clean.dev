import {
  cockpitEventSchema,
  cockpitProtocolSchemaVersion,
  telemetryProfilePresets,
  type CockpitEvent,
  type PlanTaskSummary,
  type TelemetryProfile,
  type WorktreeSnapshot,
} from '@cleandev/cockpit-protocol';
import {
  emptyProjectedState,
  foldEventsIntoState,
  type CockpitProjectRecord,
  type CockpitProjectedProjectState,
} from '@cleandev/cockpit-store';

interface DemoTaskDefinition {
  taskId: string;
  name: string;
  slug: string;
  dependsOn?: string[];
  description?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  startedMinutesAgo?: number;
  completedMinutesAgo?: number;
  progressMinutesAgo?: number;
  progressStep?: string;
  retries?: number;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

interface DemoProjectDefinition {
  projectId: string;
  slug: string;
  name: string;
  localRootPath: string;
  telemetry: TelemetryProfile;
  daemonVersion: string;
  activePlanId: string | null;
  heartbeatMinutesAgo: number;
  source: CockpitEvent['source'];
  worktrees: WorktreeSnapshot[];
  tasks: DemoTaskDefinition[];
  planOverview: string;
}

export interface DemoCockpitProject {
  project: CockpitProjectRecord;
  state: CockpitProjectedProjectState;
  events: CockpitEvent[];
}

export interface DemoCockpitSnapshot {
  generatedAt: string;
  projects: DemoCockpitProject[];
}

const DEMO_DEVICE_ID = 'demo-device-public';
const DEMO_SESSION_ID = 'demo-session-public';
const DEMO_RUN_ID = 'demo-run-public';

const PROJECT_DEFINITIONS: DemoProjectDefinition[] = [
  {
    projectId: 'demo-atlas',
    slug: 'atlas-site-refresh',
    name: 'Atlas Site Refresh',
    localRootPath: '/demo/workspaces/atlas-site-refresh',
    telemetry: telemetryProfilePresets.balanced,
    daemonVersion: '0.8.4-demo',
    activePlanId: 'plan-atlas-ux',
    heartbeatMinutesAgo: 0.1,
    source: 'live',
    planOverview: 'Landing-page refresh, pricing cleanup, and content staging before launch week.',
    worktrees: [
      {
        worktreeId: 'atlas-main',
        repoRootPath: '/demo/workspaces/atlas-site-refresh',
        worktreePath: '/demo/workspaces/atlas-site-refresh/main',
        branch: 'main',
        headSha: 'c0ffee1234ab',
        isDirty: false,
        untrackedCount: 0,
        aheadCount: 0,
        behindCount: 0,
      },
      {
        worktreeId: 'atlas-pricing',
        repoRootPath: '/demo/workspaces/atlas-site-refresh',
        worktreePath: '/demo/workspaces/atlas-site-refresh/pricing-tune',
        branch: 'feat/pricing-tuneup',
        headSha: 'faded00d55aa',
        isDirty: true,
        untrackedCount: 2,
        aheadCount: 3,
        behindCount: 0,
      },
    ],
    tasks: [
      {
        taskId: 'atlas-001',
        name: 'Ship pricing comparison cards',
        slug: 'ship-pricing-comparison-cards',
        status: 'running',
        startedMinutesAgo: 18,
        progressMinutesAgo: 1,
        progressStep: 'Hooking CMS copy into mobile card stack',
        usage: { inputTokens: 5400, outputTokens: 1800 },
      },
      {
        taskId: 'atlas-002',
        name: 'Tighten hero spacing',
        slug: 'tighten-hero-spacing',
        status: 'done',
        startedMinutesAgo: 42,
        completedMinutesAgo: 11,
        usage: { inputTokens: 2100, outputTokens: 860 },
      },
      {
        taskId: 'atlas-003',
        name: 'Audit newsletter form analytics',
        slug: 'audit-newsletter-form-analytics',
        dependsOn: ['atlas-002'],
        status: 'pending',
      },
    ],
  },
  {
    projectId: 'demo-meridian',
    slug: 'meridian-api-cutover',
    name: 'Meridian API Cutover',
    localRootPath: '/demo/workspaces/meridian-api-cutover',
    telemetry: telemetryProfilePresets.full,
    daemonVersion: '0.8.4-demo',
    activePlanId: 'plan-meridian-rollout',
    heartbeatMinutesAgo: 0.2,
    source: 'live',
    planOverview: 'Final cutover prep, smoke tests, and rollout notes for the gateway migration.',
    worktrees: [
      {
        worktreeId: 'meridian-release',
        repoRootPath: '/demo/workspaces/meridian-api-cutover',
        worktreePath: '/demo/workspaces/meridian-api-cutover/release',
        branch: 'release/cutover',
        headSha: '1234abcddcba',
        isDirty: false,
        untrackedCount: 0,
        aheadCount: 1,
        behindCount: 0,
      },
    ],
    tasks: [
      {
        taskId: 'meridian-001',
        name: 'Run gateway smoke suite',
        slug: 'run-gateway-smoke-suite',
        status: 'failed',
        startedMinutesAgo: 24,
        completedMinutesAgo: 8,
        retries: 1,
        error: 'Synthetic timeout from staging Redis while replaying queued webhooks.',
        usage: { inputTokens: 3300, outputTokens: 1400 },
      },
      {
        taskId: 'meridian-002',
        name: 'Prepare rollback notes',
        slug: 'prepare-rollback-notes',
        status: 'running',
        startedMinutesAgo: 12,
        progressMinutesAgo: 2,
        progressStep: 'Summarizing cutover checkpoints for on-call handoff',
        usage: { inputTokens: 1800, outputTokens: 900 },
      },
    ],
  },
  {
    projectId: 'demo-lantern',
    slug: 'lantern-archive-migration',
    name: 'Lantern Archive Migration',
    localRootPath: '/demo/workspaces/lantern-archive-migration',
    telemetry: telemetryProfilePresets.minimal,
    daemonVersion: '0.8.2-demo',
    activePlanId: null,
    heartbeatMinutesAgo: 95,
    source: 'archive',
    planOverview: 'Sanitized archive replay showing a recently completed migration batch.',
    worktrees: [
      {
        worktreeId: 'lantern-migration',
        repoRootPath: '/demo/workspaces/lantern-archive-migration',
        worktreePath: '/demo/workspaces/lantern-archive-migration/migration',
        branch: 'archive/replay',
        headSha: 'abcdef012345',
        isDirty: false,
        untrackedCount: 0,
        aheadCount: 0,
        behindCount: 0,
      },
    ],
    tasks: [
      {
        taskId: 'lantern-001',
        name: 'Replay public archive checkpoints',
        slug: 'replay-public-archive-checkpoints',
        status: 'done',
        startedMinutesAgo: 150,
        completedMinutesAgo: 110,
        usage: { inputTokens: 1200, outputTokens: 450 },
      },
      {
        taskId: 'lantern-002',
        name: 'Write migration summary',
        slug: 'write-migration-summary',
        dependsOn: ['lantern-001'],
        status: 'done',
        startedMinutesAgo: 108,
        completedMinutesAgo: 96,
        usage: { inputTokens: 950, outputTokens: 520 },
      },
    ],
  },
];

function minutesAgo(base: Date, minutes: number): string {
  return new Date(base.getTime() - minutes * 60_000).toISOString();
}

function buildTaskSummaries(tasks: DemoTaskDefinition[]): PlanTaskSummary[] {
  return tasks.map((task) => ({
    taskId: task.taskId,
    slug: task.slug,
    name: task.name,
    dependsOn: task.dependsOn ?? [],
    description: task.description ?? null,
    agentRole: 'worker',
    engine: 'codex',
    provider: 'openai',
    model: 'gpt-5.4',
    profile: 'balanced',
    thinking: 'medium',
  }));
}

function createEvent<T extends CockpitEvent>(event: T): T {
  return cockpitEventSchema.parse(event) as T;
}

function buildProjectEvents(definition: DemoProjectDefinition, now: Date): CockpitEvent[] {
  const events: CockpitEvent[] = [];
  let sequence = 1;

  const nextEvent = (
    type: CockpitEvent['type'],
    occurredAt: string,
    payload: CockpitEvent['payload'],
  ) => {
    events.push(createEvent({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: `${definition.projectId}-evt-${String(sequence).padStart(3, '0')}`,
      sequence,
      occurredAt,
      source: definition.source,
      projectId: definition.projectId,
      deviceId: DEMO_DEVICE_ID,
      sessionId: DEMO_SESSION_ID,
      runId: DEMO_RUN_ID,
      type,
      payload,
    } as CockpitEvent));
    sequence += 1;
  };

  nextEvent('project_seen', minutesAgo(now, 180), {
    projectName: definition.name,
    telemetry: definition.telemetry,
    localRootPath: definition.localRootPath,
  });

  for (const worktree of definition.worktrees) {
    nextEvent('worktree_seen', minutesAgo(now, 178), {
      worktree: {
        ...worktree,
        lastObservedAt: minutesAgo(now, definition.heartbeatMinutesAgo + 2),
      },
    });
  }

  nextEvent('plan_seen', minutesAgo(now, 175), {
    planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
    title: `${definition.name} cockpit demo`,
    overview: definition.planOverview,
    sourcePlanPath: `plans/${definition.slug}.md`,
    splitAt: minutesAgo(now, 170),
    taskCount: definition.tasks.length,
    tasks: buildTaskSummaries(definition.tasks),
  });

  for (const task of definition.tasks) {
    nextEvent('task_seen', minutesAgo(now, 168), {
      planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
      taskId: task.taskId,
      taskName: task.name,
      slug: task.slug,
      dependsOn: task.dependsOn ?? [],
      description: task.description ?? `${task.name} in the public cockpit demo.`,
      execution: {
        agentRole: 'worker',
        engine: 'codex',
        provider: 'openai',
        model: 'gpt-5.4',
        profile: 'balanced',
        thinking: 'medium',
      },
    });

    if (task.startedMinutesAgo != null) {
      nextEvent('task_started', minutesAgo(now, task.startedMinutesAgo), {
        planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
        taskId: task.taskId,
        taskName: task.name,
        status: 'running',
        startedAt: minutesAgo(now, task.startedMinutesAgo),
        worktreeId: definition.worktrees[0]?.worktreeId ?? null,
        execution: {
          agentRole: 'worker',
          engine: 'codex',
          provider: 'openai',
          model: 'gpt-5.4',
          profile: 'balanced',
          thinking: 'medium',
        },
      });
    }

    if (task.status === 'running' && task.progressMinutesAgo != null) {
      nextEvent('task_progressed', minutesAgo(now, task.progressMinutesAgo), {
        planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
        taskId: task.taskId,
        taskName: task.name,
        progressStatus: 'running',
        step: task.progressStep ?? 'Synthetic progress update',
        progressVisible: true,
        progressAt: minutesAgo(now, task.progressMinutesAgo),
        latestProgressAt: minutesAgo(now, task.progressMinutesAgo),
      });
    }

    if (task.status === 'done' && task.completedMinutesAgo != null) {
      nextEvent('task_completed', minutesAgo(now, task.completedMinutesAgo), {
        planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
        taskId: task.taskId,
        taskName: task.name,
        status: 'done',
        startedAt: task.startedMinutesAgo != null ? minutesAgo(now, task.startedMinutesAgo) : null,
        completedAt: minutesAgo(now, task.completedMinutesAgo),
        durationMs: task.startedMinutesAgo != null
          ? Math.max(0, Math.round((task.startedMinutesAgo - task.completedMinutesAgo) * 60_000))
          : null,
        retries: task.retries ?? 0,
        usage: task.usage,
      });
    }

    if (task.status === 'failed' && task.completedMinutesAgo != null) {
      nextEvent('task_failed', minutesAgo(now, task.completedMinutesAgo), {
        planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
        taskId: task.taskId,
        taskName: task.name,
        status: 'failed',
        startedAt: task.startedMinutesAgo != null ? minutesAgo(now, task.startedMinutesAgo) : null,
        completedAt: minutesAgo(now, task.completedMinutesAgo),
        durationMs: task.startedMinutesAgo != null
          ? Math.max(0, Math.round((task.startedMinutesAgo - task.completedMinutesAgo) * 60_000))
          : null,
        retries: task.retries ?? 0,
        error: task.error ?? 'Synthetic failure for public demo mode.',
        usage: task.usage,
      });
    }

    if (task.usage) {
      nextEvent(
        'usage_reported',
        minutesAgo(
          now,
          task.completedMinutesAgo ?? task.progressMinutesAgo ?? task.startedMinutesAgo ?? 1,
        ),
        {
          planId: definition.activePlanId ?? `${definition.projectId}-plan-archive`,
          taskId: task.taskId,
          status: task.status,
          usage: task.usage,
        },
      );
    }
  }

  nextEvent('project_heartbeat', minutesAgo(now, definition.heartbeatMinutesAgo), {
    daemonVersion: definition.daemonVersion,
    activePlanId: definition.activePlanId,
    activeTaskCount: definition.tasks.filter((task) => task.status === 'running').length,
  });

  return events;
}

function buildDemoProject(
  definition: DemoProjectDefinition,
  now: Date,
): DemoCockpitProject {
  const events = buildProjectEvents(definition, now);
  const projectedState = foldEventsIntoState(
    {
      ...emptyProjectedState(definition.projectId),
      projectSlug: definition.slug,
    },
    events,
    now,
  );

  const state: CockpitProjectedProjectState = {
    ...projectedState,
    projectSlug: definition.slug,
  };

  const project: CockpitProjectRecord = {
    projectId: definition.projectId,
    projectSlug: definition.slug,
    projectName: definition.name,
    localRootPath: definition.localRootPath,
    telemetry: definition.telemetry,
    latestEventSequence: state.lastEvent?.sequence ?? 0,
    latestEventAt: state.lastEvent?.occurredAt ? new Date(state.lastEvent.occurredAt) : null,
    projectionDirty: false,
    dirtyMarkedAt: null,
    createdAt: new Date(minutesAgo(now, 365 * 24 * 60)),
    updatedAt: now,
  };

  return { project, state, events };
}

export function getDemoCockpitSnapshot(now: Date = new Date()): DemoCockpitSnapshot {
  return {
    generatedAt: now.toISOString(),
    projects: PROJECT_DEFINITIONS.map((definition) => buildDemoProject(definition, now)),
  };
}

export function listDemoCockpitProjects(now: Date = new Date()): DemoCockpitProject[] {
  return getDemoCockpitSnapshot(now).projects;
}

export function getDemoCockpitProject(
  projectId: string,
  now: Date = new Date(),
): DemoCockpitProject | null {
  return listDemoCockpitProjects(now).find((project) => project.project.projectId === projectId) ?? null;
}
