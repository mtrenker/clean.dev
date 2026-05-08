import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchivedPlanDetailView } from './archived-plan-detail-view';
import type {
  CockpitProjectedPlanState,
  CockpitProjectedTaskState,
} from '@cleandev/cockpit-store';
import type { PlanTasksBucket } from '@/lib/cockpit/archive-detail';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('@/app/cockpit/actions', () => ({
  setTaskArchiveReviewAction: vi.fn(),
  setPlanArchiveReviewAction: vi.fn(),
}));

function task(
  overrides: Partial<CockpitProjectedTaskState> = {},
): CockpitProjectedTaskState {
  return {
    taskId: 't-1',
    planId: 'plan-1',
    taskName: 'A task',
    dependsOn: [],
    status: 'done',
    ...overrides,
  };
}

const plan: CockpitProjectedPlanState = {
  planId: 'plan-1',
  title: 'Cool plan',
  overview: 'A short summary of the plan.',
  taskCount: 2,
  tasks: [],
  lastSeenAt: '2026-05-01T10:00:00.000Z',
  source: 'archive',
  archive: {
    archiveId: 'arc-1',
    archivePath: '.pi/archive/plans/plan-1',
    archivedAt: '2026-05-01T10:00:00.000Z',
    reviewStatus: 'pending',
    runId: 'run-A',
  },
  costEstimate: {
    currency: 'USD',
    inputCost: 0.1,
    outputCost: 0.2,
    totalCost: 0.3,
  },
};

const archivedTasks: CockpitProjectedTaskState[] = [
  task({
    taskId: 't-arc',
    taskName: 'archived task',
    source: 'archive',
    archive: {
      archivedAt: '2026-05-01T10:00:00.000Z',
      reviewStatus: 'pending',
    },
  }),
];
const liveTasks: CockpitProjectedTaskState[] = [
  task({ taskId: 't-live', taskName: 'live task', status: 'running' }),
];
const tasksBucket: PlanTasksBucket = {
  archived: archivedTasks,
  live: liveTasks,
  pendingReviewCount: 1,
};

describe('ArchivedPlanDetailView', () => {
  it('renders plan title, overview, archive metadata, archived tasks, live counterpart, and review form', () => {
    render(
      <ArchivedPlanDetailView
        plan={plan}
        projectId="proj-a"
        tasks={tasksBucket}
        isArchived
      />,
    );

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Cool plan',
    );
    expect(screen.queryByText(/A short summary of the plan/)).not.toBeNull();
    expect(screen.queryByText('arc-1')).not.toBeNull();
    expect(screen.queryByText('archived task')).not.toBeNull();
    expect(screen.queryByText('live task')).not.toBeNull();
    // Run link points to the run detail
    const runLink = screen.getByRole('link', { name: /run-A/ });
    expect(runLink.getAttribute('href')).toBe(
      '/cockpit/proj-a/runs/run-A',
    );
    // Review form button rendered for archived plan
    expect(screen.queryByRole('button', { name: /Mark reviewed/ })).not.toBeNull();
  });

  it('omits the review form for live plans', () => {
    render(
      <ArchivedPlanDetailView
        plan={{ ...plan, source: 'live', archive: null }}
        projectId="proj-a"
        tasks={{ archived: [], live: liveTasks, pendingReviewCount: 0 }}
        isArchived={false}
      />,
    );
    expect(screen.queryByRole('button', { name: /Mark reviewed/ })).toBeNull();
  });
});
