import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  daemonConfigSchema,
  telemetryProfileNameSchema,
  telemetryProfilePresets,
  type DaemonConfig,
  type TelemetryProfileName,
} from '@cleandev/cockpit-protocol';

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

export const loadDaemonConfig = async (paths: DaemonPaths): Promise<LoadedDaemonConfig> => {
  try {
    const raw = await readFile(paths.configPath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;

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
  },
): DaemonConfig => {
  const telemetry = project.telemetryPreset
    ? telemetryProfilePresets[telemetryProfileNameSchema.parse(project.telemetryPreset)]
    : undefined;
  const nextProjects = [...config.projects];
  const existingIndex = nextProjects.findIndex((entry) => entry.projectId === project.projectId);
  const existingProject = existingIndex >= 0 ? nextProjects[existingIndex] : undefined;
  const nextEntry = {
    ...existingProject,
    projectId: project.projectId,
    localRootPath: project.localRootPath,
    projectSlug: project.projectSlug ?? existingProject?.projectSlug,
    projectName: project.projectName ?? existingProject?.projectName,
    telemetry: telemetry ?? existingProject?.telemetry ?? telemetryProfilePresets.balanced,
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
