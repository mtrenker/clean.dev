import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createDefaultDaemonConfig,
  redactDaemonConfig,
  resolveDaemonPaths,
  withMappedProject,
} from './config';

describe('config helpers', () => {
  it('resolves the default config and local db paths together', () => {
    const paths = resolveDaemonPaths(path.join(os.tmpdir(), 'cockpit-daemon-config.json'));

    expect(paths.configPath).toContain('cockpit-daemon-config.json');
    expect(paths.localDbPath).toContain(path.join('state', 'cockpit-daemon.sqlite3'));
  });

  it('updates mapped projects using telemetry presets from the shared protocol package', () => {
    const config = withMappedProject(createDefaultDaemonConfig(), {
      projectId: 'project-1',
      localRootPath: '/tmp/project-1',
      telemetryPreset: 'minimal',
    });

    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.telemetry.git).toBe('branch-only');
    expect(config.projects[0]?.projectId).toBe('project-1');
  });

  it('redacts stored credential tokens in previews', () => {
    const redacted = redactDaemonConfig(
      createDefaultDaemonConfig({
        credential: {
          deviceId: 'device-1',
          deviceName: 'Laptop',
          token: 'secret-token',
        },
      }),
    );

    expect(redacted.credential?.token).toBe('[redacted]');
  });
});
