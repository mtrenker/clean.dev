import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('@/app/cockpit/actions', () => ({
  setTaskArchiveReviewAction: vi.fn(),
  setPlanArchiveReviewAction: vi.fn(),
}));

import { TaskDetailView } from './task-detail-view';
import type { CockpitProjectedTaskState } from '@cleandev/cockpit-store';

function makeTask(
  overrides: Partial<CockpitProjectedTaskState> = {},
): CockpitProjectedTaskState {
  return {
    taskId: 't-1',
    planId: 'plan-1',
    taskName: 'Task 1',
    dependsOn: [],
    status: 'running',
    startedAt: '2026-05-08T11:00:00.000Z',
    durationMs: 60_000,
    execution: { engine: 'claude', model: 'sonnet', profile: 'balanced' },
    detailContent: '# Task 1\n\nDo a thing.',
    handoffSummary: '## Handoff\n\nDone.',
    outputSummary: 'all good',
    handoffContentHash: 'a'.repeat(64),
    progressHistory: [
      {
        progressStatus: 'running',
        step: 'starting up',
        progressVisible: true,
        progressAt: '2026-05-08T11:01:00.000Z',
      },
      {
        progressStatus: 'done',
        step: 'wrote handoff',
        progressVisible: true,
        progressAt: '2026-05-08T11:55:00.000Z',
      },
    ],
    usage: { inputTokens: 1000, outputTokens: 500 },
    costEstimate: {
      currency: 'USD',
      inputCost: 0.1,
      outputCost: 0.2,
      totalCost: 0.3,
    },
    ...overrides,
  };
}

describe('TaskDetailView', () => {
  it('renders the task name, plan link, and the exact task markdown', () => {
    render(<TaskDetailView task={makeTask()} projectId="proj-a" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Task 1',
    );
    // Plan label + link to plan-detail route
    expect(screen.queryByText(/plan:/)).not.toBeNull();
    const planLink = screen.getByRole('link', { name: 'plan-1' });
    expect(planLink.getAttribute('href')).toBe('/cockpit/proj-a/plans/plan-1');
    expect(screen.queryByText(/Do a thing/)).not.toBeNull();
    expect(screen.queryByText(/wrote handoff/)).not.toBeNull();
    expect(screen.queryByText(/Done\./)).not.toBeNull();
    // Cost cell
    expect(screen.queryByText('$0.3000')).not.toBeNull();
  });

  it('shows error panel for failed tasks', () => {
    render(
      <TaskDetailView
        task={makeTask({ status: 'failed', error: 'boom: something' })}
        projectId="proj-a"
      />,
    );
    expect(screen.queryByText(/boom: something/)).not.toBeNull();
  });

  it('renders archive metadata when task came from archive', () => {
    render(
      <TaskDetailView
        task={makeTask({
          status: 'done',
          source: 'archive',
          archive: {
            archiveId: 'arch-1',
            archivePath: '.pi/archive/tasks/t-1',
            archivedAt: '2026-05-01T10:00:00.000Z',
            reviewStatus: 'pending',
          },
        })}
        projectId="proj-a"
        isArchived
      />,
    );
    expect(screen.queryByText(/Archive metadata/)).not.toBeNull();
    expect(screen.queryByText('arch-1')).not.toBeNull();
    expect(screen.queryByText('.pi/archive/tasks/t-1')).not.toBeNull();
  });

  it('shows fallback empty state when telemetry omitted the task body', () => {
    render(
      <TaskDetailView
        task={makeTask({ detailContent: null, detailPath: 'tasks/t1.md' })}
        projectId="proj-a"
      />,
    );
    expect(screen.queryByText(/Task markdown not captured/)).not.toBeNull();
  });
});
