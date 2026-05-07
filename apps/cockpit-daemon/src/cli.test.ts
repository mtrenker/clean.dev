import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { runCli, type CliIo } from './cli';

// ── Mock api-client module so tests never hit the network ──────────────────────

vi.mock('./api-client', () => ({
  pairDevice: vi.fn(),
  pollExchange: vi.fn(),
  listRemoteProjects: vi.fn(),
  findRemoteProject: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

import * as apiClient from './api-client';

// ── BufferIo ───────────────────────────────────────────────────────────────────

class BufferIo implements CliIo {
  readonly stdoutChunks: string[] = [];
  readonly stderrChunks: string[] = [];

  stdout(message: string) {
    this.stdoutChunks.push(message);
  }

  stderr(message: string) {
    this.stderrChunks.push(message);
  }

  combinedStdout() {
    return this.stdoutChunks.join('');
  }

  combinedStderr() {
    return this.stderrChunks.join('');
  }
}

// ── Temp dir cleanup ───────────────────────────────────────────────────────────

const tempDirs: string[] = [];

afterEach(async () => {
  vi.clearAllMocks();
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await import('node:fs/promises').then(({ rm }) =>
      rm(dir, { recursive: true, force: true }),
    );
  }
});

// ── Test helpers ───────────────────────────────────────────────────────────────

const makeTempConfig = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-'));
  tempDirs.push(root);
  return {
    root,
    configPath: path.join(root, 'daemon-config.json'),
  };
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('cockpit daemon cli', () => {
  // ── doctor ──────────────────────────────────────────────────────────────────

  it('doctor validates a missing local config path without contacting the network', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    const exitCode = await runCli(['--config', configPath, 'doctor'], io);

    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain('Doctor check passed.');
    expect(io.combinedStdout()).toContain('missing but path is writable');
    expect(io.combinedStdout()).toContain('Network: skipped by design');
  });

  it('accepts the pnpm start double-dash wrapper before the command name', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    const exitCode = await runCli(['--', '--config', configPath, 'doctor'], io);

    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain('Doctor check passed.');
  });

  it('doctor shows credential device id when credential is configured', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    // Save credential via direct login
    await runCli(
      ['--config', configPath, 'login', '--device-id', 'dev-1', '--device-name', 'Laptop', '--token', 'tok'],
      new BufferIo(),
    );

    const exitCode = await runCli(['--config', configPath, 'doctor'], io);
    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain('dev-1');
  });

  // ── login ────────────────────────────────────────────────────────────────────

  it('login (direct) stores credential without network call', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    const exitCode = await runCli(
      [
        '--config', configPath,
        'login',
        '--device-id', 'device-1',
        '--device-name', 'Laptop',
        '--token', 'secret-token',
      ],
      io,
    );

    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain(configPath);
    expect(apiClient.pairDevice).not.toHaveBeenCalled();

    const saved = JSON.parse(await readFile(configPath, 'utf8')) as {
      credential: { deviceId: string; token: string };
    };
    expect(saved.credential.deviceId).toBe('device-1');
    expect(saved.credential.token).toBe('secret-token');
  });

  it('login (interactive) runs pairing flow and saves token on approval', async () => {
    const { configPath } = await makeTempConfig();
    // Instant delay so the loop doesn't actually sleep.
    const io: BufferIo & Pick<Required<import('./cli').CliIo>, '_delayFn'> = Object.assign(
      new BufferIo(),
      { _delayFn: async (_ms: number) => {} },
    );

    vi.mocked(apiClient.pairDevice).mockResolvedValueOnce({
      deviceCode: 'abc123',
      userCode: 'AAAAA-BBBBB',
      verificationUri: 'https://clean.dev/cockpit/devices/approve?userCode=AAAAA-BBBBB',
      expiresIn: 300,
    });

    // First poll returns pending, second returns approved
    vi.mocked(apiClient.pollExchange)
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'approved', token: 'daemon-tok', deviceId: 'dev-x' });

    const exitCode = await runCli(
      ['--config', configPath, 'login', '--device-name', 'CI Box', '--server-url', 'https://clean.dev'],
      io,
    );

    expect(exitCode).toBe(0);
    expect(apiClient.pairDevice).toHaveBeenCalledWith('https://clean.dev', expect.objectContaining({
      deviceName: 'CI Box',
    }));
    expect(io.combinedStdout()).toContain('AAAAA-BBBBB');
    expect(io.combinedStdout()).toContain('Paired successfully');

    const saved = JSON.parse(await readFile(configPath, 'utf8')) as {
      credential: { token: string };
    };
    expect(saved.credential.token).toBe('daemon-tok');
  });

  it('login (interactive) returns non-zero when pairing expires', async () => {
    const { configPath } = await makeTempConfig();
    const io: BufferIo & Pick<Required<import('./cli').CliIo>, '_delayFn'> = Object.assign(
      new BufferIo(),
      { _delayFn: async (_ms: number) => {} },
    );

    vi.mocked(apiClient.pairDevice).mockResolvedValueOnce({
      deviceCode: 'abc',
      userCode: 'XXXXX-YYYYY',
      verificationUri: 'https://clean.dev/approve?userCode=XXXXX-YYYYY',
      expiresIn: 300, // plenty of time so deadline check passes
    });

    // The exchange endpoint returns 'expired' immediately
    vi.mocked(apiClient.pollExchange).mockResolvedValueOnce({ status: 'expired' });

    const exitCode = await runCli(
      ['--config', configPath, 'login', '--device-name', 'Old Box', '--server-url', 'https://clean.dev'],
      io,
    );

    expect(exitCode).toBe(1);
    expect(io.combinedStderr()).toContain('timed out');
  });

  it('login (interactive) returns non-zero when pair API fails', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    vi.mocked(apiClient.pairDevice).mockRejectedValueOnce(
      new apiClient.ApiError(500, 'Internal server error'),
    );

    const exitCode = await runCli(
      ['--config', configPath, 'login', '--device-name', 'Box', '--server-url', 'https://clean.dev'],
      io,
    );

    expect(exitCode).toBe(1);
    expect(io.combinedStderr()).toContain('Failed to initiate pairing');
  });

  // ── logout ───────────────────────────────────────────────────────────────────

  it('logout removes a stored credential', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    await runCli(
      [
        '--config', configPath,
        'login',
        '--device-id', 'device-1',
        '--device-name', 'Laptop',
        '--token', 'secret-token',
      ],
      io,
    );
    const exitCode = await runCli(['--config', configPath, 'logout'], io);
    const savedConfig = JSON.parse(await readFile(configPath, 'utf8')) as {
      credential?: unknown;
    };

    expect(exitCode).toBe(0);
    expect(savedConfig.credential).toBeUndefined();
  });

  // ── map ──────────────────────────────────────────────────────────────────────

  it('map creates a config file that projects can be listed from (no credential)', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');
    const io = new BufferIo();

    await mkdir(projectRoot, { recursive: true });

    const mapExitCode = await runCli(
      [
        '--config', configPath,
        'map',
        '--project-id', 'project-1',
        '--path', projectRoot,
        '--telemetry', 'balanced',
      ],
      io,
    );
    const projectsExitCode = await runCli(['--config', configPath, 'projects'], io);
    const savedConfig = JSON.parse(await readFile(configPath, 'utf8')) as {
      projects: Array<{ projectId: string }>;
    };

    expect(mapExitCode).toBe(0);
    expect(projectsExitCode).toBe(0);
    expect(savedConfig.projects[0]?.projectId).toBe('project-1');
    expect(io.combinedStdout()).toContain('project-1');
    // api-client should not have been called (no credential)
    expect(apiClient.findRemoteProject).not.toHaveBeenCalled();
  });

  it('map defaults telemetry to balanced when not specified', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');

    await mkdir(projectRoot, { recursive: true });

    await runCli(
      ['--config', configPath, 'map', '--project-id', 'proj-2', '--path', projectRoot],
      new BufferIo(),
    );

    const savedConfig = JSON.parse(await readFile(configPath, 'utf8')) as {
      projects: Array<{ telemetry: { worktreePath: string } }>;
    };
    // balanced preset uses 'relative' for worktreePath
    expect(savedConfig.projects[0]?.telemetry.worktreePath).toBe('relative');
  });

  it('map validates project remotely when credential is configured', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');
    const io = new BufferIo();

    await mkdir(projectRoot, { recursive: true });

    // Save a credential first
    await runCli(
      ['--config', configPath, 'login', '--device-id', 'dev-1', '--device-name', 'Box', '--token', 'tok1'],
      new BufferIo(),
    );

    vi.mocked(apiClient.findRemoteProject).mockResolvedValueOnce({
      projectId: 'remote-proj',
      projectSlug: 'my-project',
      projectName: 'My Project',
      localRootPath: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const mapExitCode = await runCli(
      ['--config', configPath, 'map', '--project-id', 'remote-proj', '--path', projectRoot],
      io,
    );

    expect(mapExitCode).toBe(0);
    expect(apiClient.findRemoteProject).toHaveBeenCalledWith(
      expect.any(String),
      'tok1',
      'remote-proj',
    );
    expect(io.combinedStdout()).toContain('remote-proj');

    // Metadata should be auto-populated from remote
    const saved = JSON.parse(await readFile(configPath, 'utf8')) as {
      projects: Array<{ projectId: string; projectSlug: string; projectName: string }>;
    };
    expect(saved.projects[0]?.projectSlug).toBe('my-project');
    expect(saved.projects[0]?.projectName).toBe('My Project');
  });

  it('map fails when project is not found on the server', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');
    const io = new BufferIo();

    await mkdir(projectRoot, { recursive: true });

    // Save a credential
    await runCli(
      ['--config', configPath, 'login', '--device-id', 'dev-1', '--device-name', 'Box', '--token', 'tok1'],
      new BufferIo(),
    );

    vi.mocked(apiClient.findRemoteProject).mockResolvedValueOnce(null);

    const exitCode = await runCli(
      ['--config', configPath, 'map', '--project-id', 'no-such-project', '--path', projectRoot],
      io,
    );

    expect(exitCode).toBe(1);
    expect(io.combinedStderr()).toContain('not found');
  });

  // ── projects ─────────────────────────────────────────────────────────────────

  it('projects lists remote projects when credential is configured', async () => {
    const { configPath } = await makeTempConfig();
    const io = new BufferIo();

    await runCli(
      ['--config', configPath, 'login', '--device-id', 'dev-1', '--device-name', 'Box', '--token', 'tok1'],
      new BufferIo(),
    );

    vi.mocked(apiClient.listRemoteProjects).mockResolvedValueOnce([
      { projectId: 'proj-a', projectSlug: 'proj-a', projectName: 'Project A', localRootPath: null, createdAt: '2026-01-01T00:00:00.000Z' },
      { projectId: 'proj-b', projectSlug: null, projectName: null, localRootPath: null, createdAt: '2026-01-01T00:00:00.000Z' },
    ]);

    const exitCode = await runCli(['--config', configPath, 'projects'], io);

    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain('proj-a');
    expect(io.combinedStdout()).toContain('proj-b');
    expect(apiClient.listRemoteProjects).toHaveBeenCalledWith(expect.any(String), 'tok1');
  });

  it('projects lists local mappings when --local flag is used (even with credential)', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');
    const io = new BufferIo();

    await mkdir(projectRoot, { recursive: true });

    // Save credential
    await runCli(
      ['--config', configPath, 'login', '--device-id', 'dev-1', '--device-name', 'Box', '--token', 'tok1'],
      new BufferIo(),
    );

    // Map a project without remote (no credential check needed for the map in this test)
    // We'll write the config directly to avoid the remote validation
    const config = {
      schemaVersion: 1,
      serverUrl: 'https://clean.dev',
      instanceName: 'default',
      credential: { deviceId: 'dev-1', deviceName: 'Box', token: 'tok1', issuedAt: '2026-01-01T00:00:00.000Z' },
      projects: [
        {
          projectId: 'local-only-proj',
          localRootPath: projectRoot,
          telemetry: { worktreePath: 'relative', repoRootPath: 'off', git: 'full', progressText: false, usage: true, planText: true, taskDescription: true },
        },
      ],
    };
    await writeFile(configPath, JSON.stringify(config, null, 2));

    const exitCode = await runCli(['--config', configPath, 'projects', '--local'], io);

    expect(exitCode).toBe(0);
    expect(io.combinedStdout()).toContain('local-only-proj');
    expect(apiClient.listRemoteProjects).not.toHaveBeenCalled();
  });

  // ── status ───────────────────────────────────────────────────────────────────

  it('status shows project mappings and does not expose the token', async () => {
    const { root, configPath } = await makeTempConfig();
    const projectRoot = path.join(root, 'project');
    const io = new BufferIo();

    await mkdir(projectRoot, { recursive: true });

    // Write config with credential and a mapped project
    const config = {
      schemaVersion: 1,
      serverUrl: 'https://clean.dev',
      instanceName: 'default',
      credential: {
        deviceId: 'dev-status-test',
        deviceName: 'Status Box',
        token: 'super-secret-token',
        issuedAt: '2026-01-01T00:00:00.000Z',
      },
      projects: [
        {
          projectId: 'status-proj',
          localRootPath: projectRoot,
          telemetry: { worktreePath: 'relative', repoRootPath: 'off', git: 'full', progressText: false, usage: true, planText: true, taskDescription: true },
        },
      ],
    };
    await writeFile(configPath, JSON.stringify(config, null, 2));

    const exitCode = await runCli(['--config', configPath, 'status'], io);

    expect(exitCode).toBe(0);
    const output = io.combinedStdout();

    // Token must NOT appear in status output
    expect(output).not.toContain('super-secret-token');

    // Device ID and project mapping should appear
    expect(output).toContain('dev-status-test');
    expect(output).toContain('status-proj');
    expect(output).toContain(projectRoot);
  });
});
