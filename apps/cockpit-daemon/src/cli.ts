#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import {
  daemonCredentialSchema,
  telemetryProfileNameSchema,
  type DaemonConfig,
  type TelemetryProfileName,
} from '@cleandev/cockpit-protocol';

import {
  createDefaultDaemonConfig,
  loadDaemonConfig,
  redactDaemonConfig,
  resolveDaemonPaths,
  saveDaemonConfig,
  withMappedProject,
  withoutCredential,
  type DaemonPaths,
} from './config';
import { scanProjectGitWorktrees } from './adapters/git';
import { scanProjectPiFleet } from './adapters/pi-fleet';
import { inspectLocalDb, openLocalDaemonDb } from './local-db';
import { createLogger, type LoggerSink } from './logging';
import { runDaemon } from './daemon';
import {
  ApiError,
  findRemoteProject,
  listRemoteProjects,
  pairDevice,
  pollExchange,
} from './api-client';

export interface CliIo extends LoggerSink {
  /** Write a line and wait for the user to press Enter (optional – only used in interactive commands). */
  prompt?: (question: string) => Promise<string>;
  /**
   * Override the poll-delay implementation.  Defaults to real `setTimeout`.
   * Pass `async () => {}` in tests to make interactive-login tests instant.
   */
  _delayFn?: (ms: number) => Promise<void>;
}

interface ParsedCommandArgs {
  options: Map<string, string | boolean>;
  positionals: string[];
}

const defaultIo: CliIo = {
  stdout(message) {
    process.stdout.write(message);
  },
  stderr(message) {
    process.stderr.write(message);
  },
};

export const runCli = async (argv: string[], io: CliIo = defaultIo) => {
  const normalizedArgv = argv[0] === '--' ? argv.slice(1) : argv;
  const { configPathOverride, remainingArgs } = extractGlobalOptions(normalizedArgv);
  const [command = 'help', ...commandArgs] = remainingArgs;
  const paths = resolveDaemonPaths(configPathOverride);

  switch (command) {
    case 'login':
      return handleLogin(paths, commandArgs, io);
    case 'projects':
      return handleProjects(paths, commandArgs, io);
    case 'map':
      return handleMap(paths, commandArgs, io);
    case 'daemon':
      return handleDaemon(paths, commandArgs, io);
    case 'status':
      return handleStatus(paths, commandArgs, io);
    case 'preview':
      return handlePreview(paths, commandArgs, io);
    case 'doctor':
      return handleDoctor(paths, commandArgs, io);
    case 'logout':
      return handleLogout(paths, commandArgs, io);
    case 'help':
    case '--help':
    case '-h':
      printHelp(io);
      return 0;
    default:
      io.stderr(`Unknown command: ${command}\n\n`);
      printHelp(io);
      return 1;
  }
};

// ── login ──────────────────────────────────────────────────────────────────────

/**
 * `login` supports two modes:
 *
 * 1. **Interactive pairing flow** (default):
 *    `cockpit-daemon login --device-name "My Laptop" [--device-id <id>]`
 *    Calls the clean.dev pairing API, displays the user code, then polls
 *    until the user approves the device in the browser.
 *
 * 2. **Direct credential save** (legacy / CI):
 *    `cockpit-daemon login --device-id <id> --device-name <name> --token <t>`
 *    Saves the credential immediately without any network calls.
 */
const handleLogin = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  const parsed = parseCommandArgs(args);
  assertNoPositionalsFromParsed(parsed);

  const deviceName = expectOption(parsed.options, 'device-name');
  const tokenOption = optionValue(parsed.options, 'token');
  const deviceIdOption = optionValue(parsed.options, 'device-id');
  const serverUrlOption = optionValue(parsed.options, 'server-url');
  const expiresAt = optionValue(parsed.options, 'expires-at');

  // ── Legacy / CI mode: token provided directly ─────────────────────────────
  if (tokenOption) {
    const deviceId = deviceIdOption ?? generateDeviceId();
    const loaded = await loadDaemonConfig(paths);
    const config = loaded.exists ? loaded.config : createDefaultDaemonConfig();
    const credential = daemonCredentialSchema.parse({
      deviceId,
      deviceName,
      token: tokenOption,
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt ?? undefined,
    });
    const nextConfig: DaemonConfig = {
      ...config,
      serverUrl: serverUrlOption ?? config.serverUrl,
      credential,
    };

    await saveDaemonConfig(paths, nextConfig);
    io.stdout(`Saved daemon credential to ${paths.configPath}\n`);
    return 0;
  }

  // ── Interactive pairing flow ──────────────────────────────────────────────
  const loaded = await loadDaemonConfig(paths);
  const config = loaded.exists ? loaded.config : createDefaultDaemonConfig();
  const serverUrl = serverUrlOption ?? config.serverUrl;
  const deviceId = deviceIdOption ?? generateDeviceId();
  const pollIntervalMs = 5_000;
  const maxPollMs = 5 * 60 * 1000; // 5 minutes
  const delayFn = io._delayFn ?? delay;

  io.stdout(`Initiating device pairing for "${deviceName}" (deviceId: ${deviceId})…\n`);

  let pairResult: Awaited<ReturnType<typeof pairDevice>>;
  try {
    pairResult = await pairDevice(serverUrl, {
      deviceId,
      deviceName,
      instanceName: config.instanceName,
    });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : String(err);
    io.stderr(`Failed to initiate pairing: ${message}\n`);
    return 1;
  }

  io.stdout(`\nYour device code: ${pairResult.userCode}\n`);
  io.stdout(`Approve this device at:\n  ${pairResult.verificationUri}\n`);
  io.stdout(`\nWaiting for approval (expires in ${pairResult.expiresIn}s)…\n`);

  const deadline = Date.now() + Math.min(maxPollMs, pairResult.expiresIn * 1000);
  let approved = false;

  while (Date.now() < deadline) {
    await delayFn(pollIntervalMs);

    let exchangeResult: Awaited<ReturnType<typeof pollExchange>>;
    try {
      exchangeResult = await pollExchange(serverUrl, {
        deviceCode: pairResult.deviceCode,
        deviceId,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : String(err);
      io.stderr(`Exchange poll error: ${message}\n`);
      return 1;
    }

    if (exchangeResult.status === 'approved') {
      if (!exchangeResult.token) {
        io.stderr('Server returned "approved" status but no token.\n');
        return 1;
      }

      const credential = daemonCredentialSchema.parse({
        deviceId,
        deviceName,
        token: exchangeResult.token,
        issuedAt: new Date().toISOString(),
      });
      const nextConfig: DaemonConfig = {
        ...config,
        serverUrl,
        credential,
      };

      await saveDaemonConfig(paths, nextConfig);
      io.stdout(`\nPaired successfully! Credential saved to ${paths.configPath}\n`);
      approved = true;
      break;
    }

    if (exchangeResult.status === 'expired') {
      break;
    }

    // status === 'pending': keep polling
    io.stdout('.');
  }

  if (!approved) {
    io.stderr('\nPairing timed out or was not approved. Run `login` again to retry.\n');
    return 1;
  }

  return 0;
};

// ── projects ───────────────────────────────────────────────────────────────────

/**
 * `projects` lists cockpit projects:
 * - With a stored credential: fetches from the remote server (UI-defined projects).
 * - Without a credential: lists locally mapped projects from the config file.
 *
 * Add `--local` to always list local mappings regardless of credential.
 */
const handleProjects = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  const parsed = parseCommandArgs(args);
  assertNoPositionalsFromParsed(parsed);
  const forceLocal = parsed.options.has('local');

  const loaded = await loadDaemonConfig(paths);

  if (!forceLocal && loaded.config.credential) {
    // Fetch from remote
    const { serverUrl, credential } = loaded.config;
    let remoteProjects: Awaited<ReturnType<typeof listRemoteProjects>>;

    try {
      remoteProjects = await listRemoteProjects(serverUrl, credential.token);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : String(err);
      io.stderr(`Failed to fetch remote projects: ${message}\n`);
      return 1;
    }

    if (remoteProjects.length === 0) {
      io.stdout('No projects found on the server.\n');
      return 0;
    }

    io.stdout(`Remote projects (${serverUrl}):\n`);
    for (const project of remoteProjects) {
      const slug = project.projectSlug ?? '-';
      const name = project.projectName ?? '-';
      io.stdout(`${project.projectId}\t${slug}\t${name}\n`);
    }

    return 0;
  }

  // Local fallback
  if (loaded.config.projects.length === 0) {
    io.stdout('No mapped projects.\n');
    return 0;
  }

  for (const project of loaded.config.projects) {
    io.stdout(
      `${project.projectId}\t${project.localRootPath}\t${project.projectSlug ?? '-'}\t${project.projectName ?? '-'}\n`,
    );
  }

  return 0;
};

// ── map ────────────────────────────────────────────────────────────────────────

/**
 * `map` links a remote cockpit project to a local directory.
 *
 * With a credential, it validates that the project exists on the server before
 * writing the local config.  If the server returns project metadata
 * (slug, name), those are stored automatically unless the caller overrides them.
 *
 * Telemetry defaults to `balanced` (conservative) when not specified.
 */
const handleMap = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  const parsed = parseCommandArgs(args);
  assertNoPositionalsFromParsed(parsed);
  const projectId = expectOption(parsed.options, 'project-id');
  const localPath = path.resolve(expectOption(parsed.options, 'path'));
  const telemetryPreset = parseTelemetryPreset(optionValue(parsed.options, 'telemetry'));
  const stats = await stat(localPath);

  if (!stats.isDirectory()) {
    throw new Error(`Expected a directory for --path, received ${localPath}`);
  }

  const loaded = await loadDaemonConfig(paths);
  let projectSlug = optionValue(parsed.options, 'project-slug');
  let projectName = optionValue(parsed.options, 'project-name');

  // ── Remote validation ───────────────────────────────────────────────────
  if (loaded.config.credential) {
    const { serverUrl, credential } = loaded.config;

    let remoteProject: Awaited<ReturnType<typeof findRemoteProject>>;
    try {
      remoteProject = await findRemoteProject(serverUrl, credential.token, projectId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : String(err);
      io.stderr(`Failed to validate project against server: ${message}\n`);
      return 1;
    }

    if (!remoteProject) {
      io.stderr(
        `Project "${projectId}" not found on ${serverUrl}. ` +
          `Run \`projects\` to list available projects.\n`,
      );
      return 1;
    }

    // Auto-populate metadata from remote unless caller overrides.
    projectSlug ??= remoteProject.projectSlug ?? undefined;
    projectName ??= remoteProject.projectName ?? undefined;
  }

  // ── Telemetry default ──────────────────────────────────────────────────
  // Default to 'balanced' (conservative) when not specified; explicitly stated
  // in the mapped entry so it is always visible in config and status output.
  const effectiveTelemetryPreset: TelemetryProfileName = telemetryPreset ?? 'balanced';

  const nextConfig = withMappedProject(loaded.config, {
    projectId,
    localRootPath: localPath,
    projectSlug,
    projectName,
    telemetryPreset: effectiveTelemetryPreset,
  });

  await saveDaemonConfig(paths, nextConfig);
  const db = await openLocalDaemonDb(paths);
  try {
    db.syncConfiguredProjects(nextConfig.projects);
  } finally {
    db.close();
  }
  io.stdout(`Mapped ${projectId} to ${localPath}\n`);
  return 0;
};

// ── daemon ─────────────────────────────────────────────────────────────────────

const handleDaemon = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  const parsed = parseCommandArgs(args);
  assertNoPositionalsFromParsed(parsed);
  return runDaemon(paths, io);
};

// ── status ─────────────────────────────────────────────────────────────────────

const handleStatus = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  assertNoPositionals(args);
  const loaded = await loadDaemonConfig(paths);
  const dbStatus = await inspectLocalDb(paths);
  const db = await openLocalDaemonDb(paths);

  try {
    db.syncConfiguredProjects(loaded.config.projects);
    const state = db.getState();

    io.stdout(`configPath: ${paths.configPath}\n`);
    io.stdout(`configExists: ${loaded.exists}\n`);
    io.stdout(`serverUrl: ${loaded.config.serverUrl}\n`);
    io.stdout(`credentialConfigured: ${Boolean(loaded.config.credential)}\n`);
    // Show deviceId but never the token
    if (loaded.config.credential) {
      io.stdout(`credentialDeviceId: ${loaded.config.credential.deviceId}\n`);
      io.stdout(`credentialDeviceName: ${loaded.config.credential.deviceName}\n`);
    }
    io.stdout(`projectCount: ${state.configuredProjectCount}\n`);
    // List each mapped project (path only, not internal token)
    for (const project of loaded.config.projects) {
      io.stdout(
        `project: ${project.projectId}\t${project.localRootPath}\t` +
          `${project.projectSlug ?? '-'}\t${project.projectName ?? '-'}\n`,
      );
    }
    io.stdout(`observedWorktreeCount: ${state.observedWorktreeCount}\n`);
    io.stdout(`localDbPath: ${dbStatus.path}\n`);
    io.stdout(`localDbExists: ${dbStatus.exists || state.queuedEventCount >= 0}\n`);
    io.stdout(`pendingEventCount: ${state.pendingEventCount}\n`);
    io.stdout(`queuedEventCount: ${state.queuedEventCount}\n`);
    io.stdout(`lastAckedSequence: ${state.lastAckedSequence}\n`);
    return 0;
  } finally {
    db.close();
  }
};

// ── preview ────────────────────────────────────────────────────────────────────

const handlePreview = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  const loaded = await loadDaemonConfig(paths);
  const parsed = parseCommandArgs(args);
  assertNoPositionalsFromParsed(parsed);
  const projectId = optionValue(parsed.options, 'project');
  const preview = {
    configPath: paths.configPath,
    configExists: loaded.exists,
    config: redactDaemonConfig(loaded.config),
  };

  if (!projectId) {
    io.stdout(`${JSON.stringify(preview, null, 2)}\n`);
    return 0;
  }

  const project = loaded.config.projects.find((entry) => entry.projectId === projectId);

  if (!project) {
    throw new Error(`Unknown mapped project: ${projectId}`);
  }

  const db = await openLocalDaemonDb(paths);

  try {
    db.syncConfiguredProjects(loaded.config.projects);
    const deviceId = loaded.config.credential?.deviceId ?? `local-${loaded.config.instanceName}`;
    const [scan, piFleetScan] = await Promise.all([
      scanProjectGitWorktrees(db, project, deviceId),
      scanProjectPiFleet(db, project, deviceId),
    ]);
    const projectPreview = {
      ...preview,
      project: {
        projectId: project.projectId,
        projectSlug: project.projectSlug ?? null,
        projectName: project.projectName ?? null,
        telemetry: project.telemetry,
      },
      worktrees: scan.worktrees.map((worktree) => ({
        worktree: worktree.eventSnapshot,
        attention: worktree.attentionReasons.length > 0,
        attentionReasons: worktree.attentionReasons,
      })),
      scan: {
        queuedSeenCount: scan.queuedSeenCount,
        queuedChangedCount: scan.queuedChangedCount,
      },
      piFleet: {
        planId: piFleetScan.planId,
        activePlanTitle: piFleetScan.activePlanTitle,
        activeTaskCount: piFleetScan.activeTaskCount,
        queuedPlanSeenCount: piFleetScan.queuedPlanSeenCount,
        queuedTaskSeenCount: piFleetScan.queuedTaskSeenCount,
        queuedTaskStartedCount: piFleetScan.queuedTaskStartedCount,
        queuedTaskProgressedCount: piFleetScan.queuedTaskProgressedCount,
        queuedTaskCompletedCount: piFleetScan.queuedTaskCompletedCount,
        queuedTaskFailedCount: piFleetScan.queuedTaskFailedCount,
        queuedUsageReportedCount: piFleetScan.queuedUsageReportedCount,
        queuedArchiveEventCount: piFleetScan.queuedArchiveEventCount,
      },
    };

    io.stdout(`${JSON.stringify(projectPreview, null, 2)}\n`);
    return 0;
  } finally {
    db.close();
  }
};

// ── doctor ─────────────────────────────────────────────────────────────────────

const handleDoctor = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  assertNoPositionals(args);
  const loaded = await loadDaemonConfig(paths);
  const dbStatus = await inspectLocalDb(paths);
  const db = await openLocalDaemonDb(paths);

  try {
    db.syncConfiguredProjects(loaded.config.projects);
    const state = db.getState();

    io.stdout(`Doctor check passed.\n`);
    io.stdout(`Config path: ${paths.configPath}\n`);
    io.stdout(`Config file: ${loaded.exists ? 'present and valid' : 'missing but path is writable'}\n`);
    io.stdout(`Server URL: ${loaded.config.serverUrl}\n`);
    io.stdout(`Credential: ${loaded.config.credential ? `configured (device: ${loaded.config.credential.deviceId})` : 'not configured'}\n`);
    io.stdout(`Local DB directory: ${dbStatus.directory}\n`);
    io.stdout(`Local DB file: ${dbStatus.exists ? 'present' : 'initialized for state tracking'}\n`);
    io.stdout(`Configured projects in SQLite: ${state.configuredProjectCount}\n`);
    io.stdout(`Observed worktrees in SQLite: ${state.observedWorktreeCount}\n`);
    io.stdout(`Last acked sequence: ${state.lastAckedSequence}\n`);
    io.stdout(`Network: skipped by design\n`);
    return 0;
  } finally {
    db.close();
  }
};

// ── logout ─────────────────────────────────────────────────────────────────────

const handleLogout = async (paths: DaemonPaths, args: string[], io: CliIo) => {
  assertNoPositionals(args);
  const loaded = await loadDaemonConfig(paths);

  if (!loaded.exists && !loaded.config.credential) {
    io.stdout('No stored daemon credential.\n');
    return 0;
  }

  await saveDaemonConfig(paths, withoutCredential(loaded.config));
  io.stdout(`Cleared daemon credential from ${paths.configPath}\n`);
  return 0;
};

// ── Utilities ──────────────────────────────────────────────────────────────────

const parseCommandArgs = (args: string[]): ParsedCommandArgs => {
  const options = new Map<string, string | boolean>();
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split('=', 2);

    if (inlineValue !== undefined) {
      options.set(rawKey, inlineValue);
      continue;
    }

    const next = args[index + 1];

    if (next && !next.startsWith('--')) {
      options.set(rawKey, next);
      index += 1;
      continue;
    }

    options.set(rawKey, true);
  }

  return { options, positionals };
};

const extractGlobalOptions = (argv: string[]) => {
  let configPathOverride: string | undefined;
  const remainingArgs: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--config') {
      configPathOverride = argv[index + 1];
      index += 1;
      continue;
    }

    if (token.startsWith('--config=')) {
      configPathOverride = token.slice('--config='.length);
      continue;
    }

    remainingArgs.push(token);
  }

  return { configPathOverride, remainingArgs };
};

const expectOption = (options: Map<string, string | boolean>, name: string) => {
  const value = optionValue(options, name);

  if (!value) {
    throw new Error(`Missing required option --${name}`);
  }

  return value;
};

const optionValue = (options: Map<string, string | boolean>, name: string) => {
  const value = options.get(name);
  return typeof value === 'string' ? value : undefined;
};

const parseTelemetryPreset = (value?: string): TelemetryProfileName | undefined => {
  if (!value) {
    return undefined;
  }

  return telemetryProfileNameSchema.parse(value);
};

const assertNoPositionals = (args: string[]) => {
  const parsed = parseCommandArgs(args);

  assertNoPositionalsFromParsed(parsed);
};

const assertNoPositionalsFromParsed = (parsed: ParsedCommandArgs) => {
  if (parsed.positionals.length > 0) {
    throw new Error(`Unexpected positional arguments: ${parsed.positionals.join(', ')}`);
  }
};

/** Generates a random device ID (e.g. "device-a1b2c3d4e5f6"). */
const generateDeviceId = (): string =>
  `device-${randomBytes(6).toString('hex')}`;

/** Returns a Promise that resolves after `ms` milliseconds. */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const printHelp = (io: CliIo) => {
  io.stdout(`cockpit-daemon <command> [options]

Commands:
  login    Pair this device with clean.dev (interactive) or save a credential directly
  projects List projects (remote if authenticated, local otherwise)
  map      Map a clean.dev project to a local directory (validates remotely if authenticated)
  daemon   Run the scaffolded daemon entrypoint without contacting clean.dev
  status   Print local daemon status and project mappings
  preview  Print the redacted daemon config as JSON
  doctor   Validate local config and local DB paths without network access
  logout   Remove the stored daemon credential

login options:
  --device-name <name>   Human-readable device label (required)
  --device-id <id>       Stable device identifier (generated if omitted)
  --server-url <url>     Override the clean.dev server URL
  --token <t>            Save token directly (CI/testing; skips interactive pairing)
  --expires-at <iso>     Optional expiry for the credential (used with --token)

map options:
  --project-id <id>      Remote project ID to map (required)
  --path <dir>           Local directory to map to (required)
  --telemetry <preset>   Telemetry level: minimal | balanced | full (default: balanced)
  --project-slug <slug>  Override project slug (auto-populated from server if authenticated)
  --project-name <name>  Override project name (auto-populated from server if authenticated)

projects options:
  --local                Force local listing even if a credential is configured

Global options:
  --config <path>  Override the daemon config file path
`);
};

export const main = async (argv = process.argv.slice(2)) => {
  try {
    const exitCode = await runCli(argv);
    process.exitCode = exitCode;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  void main();
}
