import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CockpitProjectRecord, CockpitProjectedProjectState } from '@cleandev/cockpit-store';
import { ProjectCard } from './project-card';

const NOW = new Date('2026-05-05T12:00:00.000Z');

function makeProject(): CockpitProjectRecord {
  return {
    projectId: 'demo-atlas',
    projectSlug: 'atlas-site-refresh',
    projectName: 'Atlas Site Refresh',
    localRootPath: '/demo/workspaces/atlas-site-refresh',
    telemetry: null,
    latestEventSequence: 12,
    latestEventAt: NOW,
    projectionDirty: false,
    dirtyMarkedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makeState(): CockpitProjectedProjectState {
  return {
    schemaVersion: 1,
    projectId: 'demo-atlas',
    projectName: 'Atlas Site Refresh',
    projectSlug: 'atlas-site-refresh',
    localRootPath: '/demo/workspaces/atlas-site-refresh',
    telemetry: null,
    dirty: false,
    lastEvent: null,
    lastHeartbeat: {
      occurredAt: NOW.toISOString(),
      daemonVersion: '0.8.4-demo',
      activePlanId: 'plan-atlas-ux',
      activeTaskCount: 1,
    },
    worktrees: {},
    plans: {},
    tasks: {},
  };
}

describe('ProjectCard', () => {
  it('links to the private cockpit route by default', () => {
    render(<ProjectCard project={makeProject()} state={makeState()} />);

    expect(
      screen.getByRole('link', { name: 'View cockpit for Atlas Site Refresh' }).getAttribute('href'),
    ).toBe('/cockpit/demo-atlas');
  });

  it('can target the public demo route without pointing at private pages', () => {
    render(
      <ProjectCard
        project={makeProject()}
        state={makeState()}
        hrefBase="/demo/cockpit"
      />,
    );

    expect(
      screen.getByRole('link', { name: 'View demo cockpit for Atlas Site Refresh' }).getAttribute('href'),
    ).toBe('/demo/cockpit/demo-atlas');
  });
});
