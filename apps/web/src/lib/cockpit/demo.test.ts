import { describe, expect, it } from 'vitest';
import { cockpitEventSchema } from '@cleandev/cockpit-protocol';
import { getDemoCockpitProject, getDemoCockpitSnapshot } from './demo';

describe('demo cockpit data', () => {
  it('builds validated synthetic projects without touching private identifiers', () => {
    const snapshot = getDemoCockpitSnapshot(new Date('2026-05-05T12:00:00.000Z'));

    expect(snapshot.projects).toHaveLength(3);
    expect(snapshot.projects.every(({ project }) => project.projectId.startsWith('demo-'))).toBe(true);

    for (const demoProject of snapshot.projects) {
      expect(demoProject.project.projectionDirty).toBe(false);
      expect(demoProject.project.localRootPath?.startsWith('/demo/')).toBe(true);
      expect(Object.keys(demoProject.state.tasks).length).toBeGreaterThan(0);
      expect(
        demoProject.events.every((event) => event.projectId === demoProject.project.projectId),
      ).toBe(true);
      expect(() => demoProject.events.forEach((event) => cockpitEventSchema.parse(event))).not.toThrow();
    }
  });

  it('marks stale archive replay projects dirty while keeping active live projects fresh', () => {
    const snapshot = getDemoCockpitSnapshot(new Date('2026-05-05T12:00:00.000Z'));
    const atlas = snapshot.projects.find(({ project }) => project.projectId === 'demo-atlas');
    const lantern = snapshot.projects.find(({ project }) => project.projectId === 'demo-lantern');

    expect(atlas?.state.dirty).toBe(false);
    expect(lantern?.state.dirty).toBe(true);
    expect(lantern?.state.lastEvent?.source).toBe('archive');
  });

  it('returns a single project snapshot by id', () => {
    const project = getDemoCockpitProject('demo-meridian', new Date('2026-05-05T12:00:00.000Z'));

    expect(project?.project.projectName).toBe('Meridian API Cutover');
    expect(project?.state.lastHeartbeat?.activeTaskCount).toBe(1);
  });
});
