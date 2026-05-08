import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchiveOverview } from './archive-overview';
import type {
  ArchivedPlanDetailRow,
  ArchivedTaskDetailRow,
  ArchiveRunRow,
} from '@/lib/cockpit/archive-detail';

const planRow: ArchivedPlanDetailRow = {
  plan: {
    planId: 'plan-1',
    title: 'A pending plan',
    taskCount: 3,
    tasks: [],
    lastSeenAt: '2026-05-01T10:00:00.000Z',
    source: 'archive',
    archive: {
      archivedAt: '2026-05-01T10:00:00.000Z',
      reviewStatus: 'pending',
      archivePath: '.pi/archive/plans/plan-1',
      runId: 'run-A',
    },
  },
  reviewStatus: 'pending',
  archivedAt: '2026-05-01T10:00:00.000Z',
  taskCount: 3,
  pendingTaskCount: 2,
  inputTokens: 1_000,
  outputTokens: 500,
  costUsd: 0.5,
  runId: 'run-A',
};

const taskRow: ArchivedTaskDetailRow = {
  task: {
    taskId: 't-1',
    planId: 'plan-1',
    taskName: 'A archived task',
    dependsOn: [],
    status: 'done',
    source: 'archive',
    archive: {
      archivedAt: '2026-05-01T10:00:00.000Z',
      reviewStatus: 'pending',
      runId: 'run-A',
    },
  },
  reviewStatus: 'pending',
  archivedAt: '2026-05-01T10:00:00.000Z',
  runId: 'run-A',
  hasLiveCounterpart: true,
  liveCounterpartTaskId: 'live-t-1',
};

const runRow: ArchiveRunRow = {
  runId: 'run-A',
  startedAt: '2026-05-01T09:00:00.000Z',
  endedAt: '2026-05-01T11:00:00.000Z',
  planIds: ['plan-1'],
  taskIds: ['t-1'],
  plans: [planRow.plan],
  tasks: [taskRow.task],
  pendingReviews: 1,
  inputTokens: 1_000,
  outputTokens: 500,
  costUsd: 0.5,
};

describe('ArchiveOverview', () => {
  it('renders plan, task and run sections with the right links', () => {
    render(
      <ArchiveOverview
        projectId="proj-a"
        projectName="Project A"
        plans={[planRow]}
        tasks={[taskRow]}
        runs={[runRow]}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1 }).textContent,
    ).toContain('Archive · Project A');
    expect(screen.getByText('A pending plan')).toBeTruthy();
    expect(screen.getByText('A archived task')).toBeTruthy();
    // The plan title link points to the plan-detail route
    const planLink = screen.getByRole('link', { name: 'A pending plan' });
    expect(planLink.getAttribute('href')).toBe('/cockpit/proj-a/plans/plan-1');
    // Task link points to per-task drilldown
    const taskLink = screen.getByRole('link', { name: 'A archived task' });
    expect(taskLink.getAttribute('href')).toBe('/cockpit/proj-a/tasks/t-1');
    // Live counterpart link is present in the "Live?" column
    expect(screen.queryByText('live ↗')).not.toBeNull();
    // Run row appears with a link to the run detail
    const runLinks = screen.getAllByRole('link', { name: 'run-A' });
    expect(runLinks[0]?.getAttribute('href')).toBe('/cockpit/proj-a/runs/run-A');
  });

  it('shows empty states when there are no plans or tasks', () => {
    render(
      <ArchiveOverview
        projectId="proj-a"
        projectName="Project A"
        plans={[]}
        tasks={[]}
        runs={[]}
      />,
    );
    expect(screen.queryByText(/No archived plans/)).not.toBeNull();
    expect(screen.queryByText(/No archived tasks/)).not.toBeNull();
  });
});
