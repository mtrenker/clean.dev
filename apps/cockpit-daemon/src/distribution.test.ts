import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  buildDaemonDistribution,
  renderInstallScript,
  renderLauncherScript,
  resolveDistributionTarget,
} from './distribution';

const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await import('node:fs/promises').then(({ rm }) => rm(dir, { recursive: true, force: true }));
  }
});

const makeTempDir = async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-dist-'));
  tempDirs.push(dir);
  return dir;
};

describe('cockpit daemon distribution packaging', () => {
  it('resolves the current supported host target', () => {
    const target = resolveDistributionTarget(undefined, {
      platform: 'linux',
      arch: 'x64',
    });

    expect(target).toEqual({
      platform: 'linux',
      arch: 'x64',
      id: 'linux-x64',
    });
  });

  it('rejects unsupported targets with a clear error', () => {
    expect(() =>
      resolveDistributionTarget('win32-x64', {
        platform: 'win32',
        arch: 'x64',
      }),
    ).toThrow(/Unsupported cockpit-daemon distribution target/);
  });

  it('rejects cross-packaging to keep the bundled runtime host-matched', () => {
    expect(() =>
      resolveDistributionTarget('darwin-arm64', {
        platform: 'linux',
        arch: 'x64',
      }),
    ).toThrow(/Cross-packaging is not supported/);
  });

  it('builds a runnable distribution layout with installer metadata', async () => {
    const root = await makeTempDir();
    const bundlePath = path.join(root, 'cockpit-daemon.cjs');
    const runtimeBinaryPath = path.join(root, 'node');
    const packageRoot = path.join(root, 'release');

    await writeFile(bundlePath, 'console.log("ok");\n', 'utf8');
    await writeFile(runtimeBinaryPath, '#!/bin/sh\nexit 0\n', 'utf8');

    const result = await buildDaemonDistribution({
      packageRoot,
      bundlePath,
      runtimeBinaryPath,
      target: {
        platform: 'linux',
        arch: 'x64',
        id: 'linux-x64',
      },
      packageVersion: '0.1.0',
      nodeVersion: 'v22.22.1',
    });

    const manifest = JSON.parse(
      await readFile(path.join(result.packageDir, 'manifest.json'), 'utf8'),
    ) as {
      target: string;
      nodeVersion: string;
      installScript: string;
    };

    expect(manifest.target).toBe('linux-x64');
    expect(manifest.nodeVersion).toBe('v22.22.1');
    expect(manifest.installScript).toBe('install.sh');
    expect(await readFile(path.join(result.packageDir, 'bin', 'cockpit-daemon'), 'utf8')).toBe(
      renderLauncherScript(),
    );
    expect(await readFile(path.join(result.packageDir, 'install.sh'), 'utf8')).toBe(
      renderInstallScript('0.1.0', 'linux-x64'),
    );
    await expect(readFile(result.archivePath, 'utf8')).resolves.toBeDefined();
  });
});
