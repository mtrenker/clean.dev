import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewStats } from './overview-stats';
import type { FleetOverview } from '@/lib/cockpit/overview-aggregate';

function makeOverview(overrides: Partial<FleetOverview> = {}): FleetOverview {
  return {
    totalProjects: 5,
    activeProjects: 3,
    staleProjects: 1,
    offlineProjects: 1,
    activeDeviceCount: 2,
    totalDeviceCount: 4,
    runningAgents: 1,
    failedTasks: 0,
    worktreesNeedingCleanup: 2,
    archivedPlansAwaitingReview: 1,
    totalInputTokens: 12_345,
    totalOutputTokens: 6_789,
    totalEstimatedCostUsd: 1.23,
    ...overrides,
  };
}

describe('OverviewStats', () => {
  it('renders the six headline cells with formatted counts', () => {
    const { container } = render(<OverviewStats overview={makeOverview()} />);
    expect(screen.queryByText('Projects')).not.toBeNull();
    expect(screen.queryByText('Devices')).not.toBeNull();
    expect(screen.queryByText('Agents running')).not.toBeNull();
    expect(screen.queryByText('Cleanup queue')).not.toBeNull();
    expect(screen.queryByText('Archive review')).not.toBeNull();
    expect(screen.queryByText('Estimated cost')).not.toBeNull();

    // Cost is rendered with the right formatter
    expect(screen.queryByText('$1.23')).not.toBeNull();

    // Token total combines input + output and formats with locale separators
    expect(screen.queryByText('19,134 tokens')).not.toBeNull();

    // The status banner is identifiable for screen readers
    expect(
      container.querySelector('[role="status"][aria-label="Fleet overview summary"]'),
    ).not.toBeNull();
  });

  it('shows "all live" when no projects are stale or offline', () => {
    render(
      <OverviewStats
        overview={makeOverview({
          activeProjects: 4,
          staleProjects: 0,
          offlineProjects: 0,
          totalProjects: 4,
        })}
      />,
    );
    expect(screen.queryByText('all live')).not.toBeNull();
  });

  it('reports a warning hint when failed tasks are present', () => {
    render(
      <OverviewStats
        overview={makeOverview({
          worktreesNeedingCleanup: 1,
          failedTasks: 3,
        })}
      />,
    );
    expect(screen.queryByText('3 failed tasks')).not.toBeNull();
  });
});
