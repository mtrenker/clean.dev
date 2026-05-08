import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectWorktreesPanel } from './project-worktrees-panel';
import type { WorktreeGroupRow } from '@/lib/cockpit/project-detail';

const NOW_ISO = '2026-05-08T11:55:00.000Z';

describe('ProjectWorktreesPanel', () => {
  it('renders the empty state when no groups are present', () => {
    render(<ProjectWorktreesPanel rows={[]} />);
    expect(screen.queryByText('No worktrees observed')).not.toBeNull();
  });

  it('renders each group with branches and cleanup badges', () => {
    const rows: WorktreeGroupRow[] = [
      {
        groupName: 'feature',
        cleanupCount: 1,
        observingDeviceIds: ['dev-1'],
        worktrees: [
          {
            worktreeId: 'wt-a',
            branch: 'feature/new',
            isDirty: true,
            untrackedCount: 0,
            aheadCount: 2,
            behindCount: 1,
            lastObservedAt: NOW_ISO,
            worktreePath: '/repos/main/feature-new',
            headSha: 'abc1234deadbeef',
          },
          {
            worktreeId: 'wt-b',
            branch: 'feature/old',
            isDirty: false,
            untrackedCount: 0,
            aheadCount: 0,
            behindCount: 0,
            lastObservedAt: NOW_ISO,
          },
        ],
      },
    ];
    render(<ProjectWorktreesPanel rows={rows} />);
    expect(screen.queryByText(/▸ feature/)).not.toBeNull();
    expect(screen.queryByText(/seen by dev-1/)).not.toBeNull();
    expect(screen.queryByText('feature/new')).not.toBeNull();
    expect(screen.queryByText('feature/old')).not.toBeNull();
    expect(screen.queryByText(/diverged \+2\/-1/)).not.toBeNull();
    expect(screen.queryByText('clean')).not.toBeNull();
    expect(screen.queryByText('abc1234')).not.toBeNull();
  });
});
