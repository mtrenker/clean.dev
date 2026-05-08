import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  daemonConfigSchema,
  mappedProjectSchema,
  projectObservationConfigSchema,
  telemetryProfileNameSchema,
  telemetryProfilePresets,
  type DaemonConfig,
  type MappedProject,
  type ProjectObservationConfig,
  type TelemetryProfile,
  type TelemetryProfileName,
} from '@cleandev/cockpit-protocol';
import type { RemoteProjectConfig } from './api-client';

import { resolveLocalDbPath } from './local-db';

export interface DaemonPaths {
  configPath: string;
  configDir: string;
  localDbPath: string;
  localDbDir: string;
}

export interface LoadedDaemonConfig {
  config: DaemonConfig;
  exists: boolean;
}

const DEFAULT_SERVER_URL = process.env.CLEANDEV_COCKPIT_SERVER_URL ?? 'https://clean.dev';

export const defaultConfigPath = () =>
  path.join(os.homedir(), '.config', 'clean.dev', 'cockpit-daemon', 'config.json');

export const resolveDaemonPaths = (configPathOverride?: string): DaemonPaths => {
  const configPath = path.resolve(
    configPathOverride ?? process.env.CLEANDEV_COCKPIT_CONFIG ?? defaultConfigPath(),
  );
  const localDbPath = resolveLocalDbPath(configPath);

  return {
    configPath,
    configDir: path.dirname(configPath),
    localDbPath,
    localDbDir: path.dirname(localDbPath),
  };
};

export const createDefaultDaemonConfig = (
  overrides: Partial<DaemonConfig> = {},
): DaemonConfig =>
  daemonConfigSchema.parse({
    serverUrl: DEFAULT_SERVER_URL,
    instanceName: 'default',
    projects: [],
    ...overrides,
  });

/**
 * Migrate a raw config object to the current schema version.
 *
 * Currently upgrades schema version 1 → 2 by setting the correct schema
 * version and letting `daemonConfigSchema.parse` fill in the defaults.
 */
function migrateRawConfig(raw: unknown): unknown {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    !Array.isArray(raw) &&
    'schemaVersion' in raw &&
    (raw as Record<string, unknown>).schemaVersion === 1
  ) {
    return { ...(raw as Record<string, unknown>), schemaVersion: 2 };
  }

  return raw;
}

export const loadDaemonConfig = async (paths: DaemonPaths): Promise<LoadedDaemonConfig> => {
  try {
    const raw = await readFile(paths.configPath, 'utf8');
    const parsed = migrateRawConfig(JSON.parse(raw) as unknown);

    return {
      config: daemonConfigSchema.parse(parsed),
      exists: true,
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        config: createDefaultDaemonConfig(),
        exists: false,
      };
    }

    throw error;
  }
};

export const saveDaemonConfig = async (paths: DaemonPaths, config: DaemonConfig) => {
  const normalized = daemonConfigSchema.parse(config);

  await mkdir(paths.configDir, { recursive: true });
  await writeFile(paths.configPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
};

export const withMappedProject = (
  config: DaemonConfig,
  project: {
    projectId: string;
    localRootPath: string;
    projectSlug?: string;
    projectName?: string;
    telemetryPreset?: TelemetryProfileName;
    /** Server-defined observation config (may be overridden by local config). */
    serverObservation?: ProjectObservationConfig | null;
    /** Server-defined worktree root path. */
    serverWorktreeRootPath?: string | null;
  },
): DaemonConfig => {
  const telemetry = project.telemetryPreset
    ? telemetryProfilePresets[telemetryProfileNameSchema.parse(project.telemetryPreset)]
    : undefined;
  const nextProjects = [...config.projects];
  const existingIndex = nextProjects.findIndex((entry) => entry.projectId === project.projectId);
  const existingProject = existingIndex >= 0 ? nextProjects[existingIndex] : undefined;
  const rawObservation = project.serverObservation ?? existingProject?.observation ?? null;
  const rawWorktreeRootPath = project.serverWorktreeRootPath ?? existingProject?.worktreeRootPath ?? undefined;
  // Always resolve a complete observation so the entry satisfies MappedProject.
  const observation = projectObservationConfigSchema.parse(rawObservation ?? {});
  const nextEntry: MappedProject = {
    ...(existingProject ?? { projectId: project.projectId, localRootPath: project.localRootPath }),
    projectId: project.projectId,
    localRootPath: project.localRootPath,
    projectSlug: project.projectSlug ?? existingProject?.projectSlug,
    projectName: project.projectName ?? existingProject?.projectName,
    telemetry: telemetry ?? existingProject?.telemetry ?? telemetryProfilePresets.balanced,
    observation,
    ...(rawWorktreeRootPath !== undefined ? { worktreeRootPath: rawWorktreeRootPath } : {}),
  };

  if (existingIndex >= 0) {
    nextProjects[existingIndex] = nextEntry;
  } else {
    nextProjects.push(nextEntry);
  }

  return daemonConfigSchema.parse({
    ...config,
    projects: nextProjects,
  });
};

/**
 * Merge a server-defined project config into the local mapped project entry,
 * preserving any local overrides (localRootPath, telemetryPreset).
 *
 * Local overrides that are NOT undefined take precedence over server values.
 * The server-defined `observation` is always applied unless the local entry
 * explicitly overrides it.
 */
export const mergeProjectConfig = (
  local: MappedProject,
  remote: RemoteProjectConfig,
): MappedProject => {
  const merged: MappedProject = {
    ...local,
    // Accept server slug/name if not locally overridden
    projectSlug: local.projectSlug ?? remote.projectSlug ?? undefined,
    projectName: local.projectName ?? remote.projectName ?? undefined,
    // Server-defined worktree root takes precedence unless local already has one
    worktreeRootPath: local.worktreeRootPath ?? remote.worktreeRootPath ?? undefined,
    // Server observation config fills in unset local observation
    observation: local.observation ?? remote.observation ?? undefined,
    // Server telemetry fills in only if local has no override
    telemetry: local.telemetry ?? remote.telemetry ?? telemetryProfilePresets.balanced,
  };

  return mappedProjectSchema.parse(merged);
};

/**
 * Returns the effective (merged) observation config for a project.
 *
 * Starts from a parsed default, then layers server-defined config, then
 * local overrides (local wins).
 */
export const resolveProjectObservation = (
  serverObservation: ProjectObservationConfig | null | undefined,
  localObservation?: ProjectObservationConfig | null,
): ProjectObservationConfig => {
  const base = projectObservationConfigSchema.parse({});
  if (!serverObservation && !localObservation) {
    return base;
  }

  return projectObservationConfigSchema.parse({
    ...base,
    ...(serverObservation ?? {}),
    ...(localObservation ?? {}),
  });
};

/**
 * Returns the effective (merged) telemetry config for a project.
 *
 * Local wins over server which wins over the default balanced preset.
 */
export const resolveProjectTelemetry = (
  serverTelemetry: TelemetryProfile | null | undefined,
  localTelemetry?: TelemetryProfile | null,
): TelemetryProfile => {
  if (localTelemetry) {
    return localTelemetry;
  }

  if (serverTelemetry) {
    return serverTelemetry;
  }

  return telemetryProfilePresets.balanced;
};

export const withoutCredential = (config: DaemonConfig): DaemonConfig =>
  daemonConfigSchema.parse({
    ...config,
    credential: undefined,
  });

export const redactDaemonConfig = (config: DaemonConfig) =>
  daemonConfigSchema.parse({
    ...config,
    credential: config.credential
      ? {
          ...config.credential,
          token: '[redacted]',
        }
      : undefined,
  });

const isMissingFileError = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT';
