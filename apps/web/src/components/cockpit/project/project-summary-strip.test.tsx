import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectSummaryStrip } from './project-summary-strip';
import type { ProjectSummary } from '@/lib/cockpit/project-detail';

function makeSummary(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    totalDevices: 0,
    activeDevices: 0,
    staleDevices: 0,
    worktreeCount: 0,
    worktreeGroups: 0,
    worktreesNeedingCleanup: 0,
    livePlans: 0,
    archivedPlans: 0,
    archivedPlansAwaitingReview: 0,
    liveTasks: 0,
    archivedTasks: 0,
    runningTasks: 0,
    failedTasks: 0,
    completedTasks: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalEstimatedCostUsd: 0,
    ...overrides,
  };
}

describe('ProjectSummaryStrip', () => {
  it('renders the six stat cells with project label', () => {
    const summary = makeSummary({
      totalDevices: 4,
      activeDevices: 2,
      staleDevices: 2,
      worktreeCount: 7,
      worktreeGroups: 3,
      worktreesNeedingCleanup: 2,
      liveTasks: 5,
      runningTasks: 1,
      failedTasks: 1,
      livePlans: 2,
      archivedPlans: 1,
      archivedPlansAwaitingReview: 1,
      archivedTasks: 4,
      totalInputTokens: 1000,
      totalOutputTokens: 500,
      totalEstimatedCostUsd: 0.42,
    });
    render(<ProjectSummaryStrip summary={summary} />);
    expect(screen.getByLabelText('Project summary')).not.toBeNull();
    expect(screen.queryByText('Devices')).not.toBeNull();
    expect(screen.queryByText('Worktrees')).not.toBeNull();
    expect(screen.queryByText('Live tasks')).not.toBeNull();
    expect(screen.queryByText('Plans')).not.toBeNull();
    expect(screen.queryByText('Archive review')).not.toBeNull();
    expect(screen.queryByText('Est. cost')).not.toBeNull();
    expect(screen.queryByText('$0.4200')).not.toBeNull();
    expect(screen.queryByText(/2 active/)).not.toBeNull();
  });

  it('renders zeros when state is empty', () => {
    render(<ProjectSummaryStrip summary={makeSummary()} />);
    expect(screen.queryAllByText('0').length).toBeGreaterThan(0);
    expect(screen.queryByText('$0.00')).not.toBeNull();
  });
});
