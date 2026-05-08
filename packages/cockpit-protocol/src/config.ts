import { z } from 'zod';

export const cockpitProtocolSchemaVersion = 2 as const;
export const cockpitProtocolSchemaVersionSchema = z.literal(cockpitProtocolSchemaVersion);
export const supportedCockpitProtocolSchemaVersions = [1, cockpitProtocolSchemaVersion] as const;
export const supportedCockpitProtocolSchemaVersionSchema = z.union([
  z.literal(1),
  cockpitProtocolSchemaVersionSchema,
]);

export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const identifierSchema = z.string().min(1).max(160);
export const shortTextSchema = z.string().min(1).max(512);
export const longTextSchema = z.string().min(1).max(10_000);
export const relativeFilePathSchema = z.string().min(1).max(2_000);
export const templateTextSchema = z.string().min(1).max(256);

export const telemetryPathModeSchema = z.enum(['off', 'basename', 'relative', 'full']);
export const telemetryGitModeSchema = z.enum(['off', 'branch-only', 'full']);

export const telemetryProfileSchema = z.object({
  worktreePath: telemetryPathModeSchema.default('relative'),
  repoRootPath: telemetryPathModeSchema.default('off'),
  git: telemetryGitModeSchema.default('full'),
  progressText: z.boolean().default(false),
  usage: z.boolean().default(true),
  planText: z.boolean().default(true),
  taskDescription: z.boolean().default(true),
});

export type TelemetryProfile = z.infer<typeof telemetryProfileSchema>;

export const telemetryProfileNameSchema = z.enum(['minimal', 'balanced', 'full']);
export type TelemetryProfileName = z.infer<typeof telemetryProfileNameSchema>;

export const worktreeGroupingModeSchema = z.enum(['branch', 'directory', 'device', 'custom']);
export type WorktreeGroupingMode = z.infer<typeof worktreeGroupingModeSchema>;

export const worktreeObservationPatternSchema = z.object({
  nameTemplate: templateTextSchema.default('{branch}'),
  groupBy: worktreeGroupingModeSchema.default('branch'),
  groupNameTemplate: templateTextSchema.default('{group}'),
});

export type WorktreeObservationPattern = z.infer<typeof worktreeObservationPatternSchema>;

export const projectObservationConfigSchema = z.object({
  alias: shortTextSchema.nullable().optional(),
  staleAfterMs: z.number().int().positive().max(86_400_000).default(60_000),
  includeArchived: z.boolean().default(true),
  worktrees: worktreeObservationPatternSchema.default({
    nameTemplate: '{branch}',
    groupBy: 'branch',
    groupNameTemplate: '{group}',
  }),
});

export type ProjectObservationConfig = z.infer<typeof projectObservationConfigSchema>;

export const telemetryProfilePresets: Record<TelemetryProfileName, TelemetryProfile> = {
  minimal: {
    worktreePath: 'off',
    repoRootPath: 'off',
    git: 'branch-only',
    progressText: false,
    usage: true,
    planText: false,
    taskDescription: false,
  },
  balanced: {
    worktreePath: 'relative',
    repoRootPath: 'off',
    git: 'full',
    progressText: false,
    usage: true,
    planText: true,
    taskDescription: true,
  },
  full: {
    worktreePath: 'full',
    repoRootPath: 'relative',
    git: 'full',
    progressText: true,
    usage: true,
    planText: true,
    taskDescription: true,
  },
};

export const mappedProjectSchema = z.object({
  projectId: identifierSchema,
  projectSlug: identifierSchema.optional(),
  projectName: shortTextSchema.optional(),
  localRootPath: z.string().min(1).max(2_000),
  worktreeRootPath: z.string().min(1).max(2_000).optional(),
  observation: projectObservationConfigSchema.default({
    staleAfterMs: 60_000,
    includeArchived: true,
    worktrees: {
      nameTemplate: '{branch}',
      groupBy: 'branch',
      groupNameTemplate: '{group}',
    },
  }),
  telemetry: telemetryProfileSchema.default(telemetryProfilePresets.balanced),
});

export type MappedProject = z.infer<typeof mappedProjectSchema>;

export const daemonCredentialSchema = z.object({
  deviceId: identifierSchema,
  deviceName: shortTextSchema,
  token: z.string().min(1).max(512),
  issuedAt: isoDateTimeSchema.optional(),
  expiresAt: isoDateTimeSchema.nullable().optional(),
});

export type DaemonCredential = z.infer<typeof daemonCredentialSchema>;

export const daemonConfigSchema = z.object({
  schemaVersion: cockpitProtocolSchemaVersionSchema.default(cockpitProtocolSchemaVersion),
  serverUrl: z.string().url().max(2_000),
  instanceName: shortTextSchema.default('default'),
  configPath: relativeFilePathSchema.optional(),
  credential: daemonCredentialSchema.optional(),
  projects: z.array(mappedProjectSchema).default([]),
});

export type DaemonConfig = z.infer<typeof daemonConfigSchema>;
