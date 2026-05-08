import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  cockpitProtocolSchemaVersion,
  worktreeSnapshotSchema,
  type BranchUpstream,
  type MappedProject,
  type TelemetryProfile,
  type WorktreeSnapshot,
} from '@cleandev/cockpit-protocol';

import { type LocalDaemonDb, hashSnapshot } from '../local-db';

const execFileAsync = promisify(execFile);

interface RawGitWorktree {
  worktreePath: string;
  headSha: string | null;
  branch: string | null;
  isDetached: boolean;
}

interface WorktreeStatus {
  isDirty: boolean;
  untrackedCount: number;
  stagedCount: number;
  unstagedCount: number;
}

interface WorktreeNaming {
  relativeWorktreePath: string;
  displayName: string | null;
  groupName: string | null;
  unknownPattern: boolean;
}

interface DefaultBranchDivergence {
  defaultBranch: string | null;
  aheadCount: number | null;
  behindCount: number | null;
}

interface GitWorktreeScan {
  worktreeId: string;
  repoRootPath: string | null;
  worktreePath: string;
  relativeWorktreePath: string;
  displayName: string | null;
  groupName: string | null;
  branch: string | null;
  branchUpstream: BranchUpstream | null;
  headSha: string | null;
  isDirty: boolean;
  untrackedCount: number;
  stagedCount: number;
  unstagedCount: number;
  aheadCount: number | null;
  behindCount: number | null;
  defaultBranch: string | null;
  defaultAheadCount: number | null;
  defaultBehindCount: number | null;
  isDetached: boolean;
  unknownPattern: boolean;
  lastObservedAt: string;
  snapshotHash: string;
  eventSnapshot: WorktreeSnapshot;
  previewSnapshot: WorktreeSnapshot;
  attentionReasons: string[];
}

export interface ProjectGitScanResult {
  projectId: string;
  repoRootPath: string | null;
  worktrees: GitWorktreeScan[];
  queuedSeenCount: number;
  queuedChangedCount: number;
}

export const scanProjectGitWorktrees = async (
  db: LocalDaemonDb,
  project: MappedProject,
  deviceId: string,
): Promise<ProjectGitScanResult> => {
  const repoRootPath = await resolveRepoRootPath(project.localRootPath);
  const resolvedWorktreeRoot = resolveConfiguredWorktreeRoot(project, repoRootPath);
  const rawWorktrees = await listGitWorktrees(project.localRootPath);
  const observedAt = new Date().toISOString();
  let queuedSeenCount = 0;
  let queuedChangedCount = 0;

  const worktrees: GitWorktreeScan[] = [];

  for (const rawWorktree of rawWorktrees) {
    const status = await readWorktreeStatus(rawWorktree.worktreePath);
    const upstream =
      rawWorktree.branch === null ? null : await readBranchUpstream(rawWorktree.worktreePath);
    const defaultBranchDivergence = await readDefaultBranchDivergence(
      rawWorktree.worktreePath,
      upstream?.remoteName ?? null,
    );
    const naming = deriveWorktreeNaming(project, rawWorktree, resolvedWorktreeRoot, upstream, deviceId);
    const worktreeId = createWorktreeId(project.projectId, rawWorktree.worktreePath);
    const baseSnapshot = {
      worktreeId,
      repoRootPath,
      worktreePath: rawWorktree.worktreePath,
      displayName: naming.displayName,
      groupName: naming.groupName,
      branch: rawWorktree.branch,
      branchUpstream: upstream,
      headSha: rawWorktree.headSha,
      isDirty: status.isDirty,
      untrackedCount: status.untrackedCount,
      stagedCount: status.stagedCount,
      unstagedCount: status.unstagedCount,
      aheadCount: upstream?.aheadCount ?? null,
      behindCount: upstream?.behindCount ?? null,
      defaultBranch: defaultBranchDivergence.defaultBranch,
      defaultAheadCount: defaultBranchDivergence.aheadCount,
      defaultBehindCount: defaultBranchDivergence.behindCount,
      relativeWorktreePath: naming.relativeWorktreePath,
      isDetached: rawWorktree.isDetached,
      unknownPattern: naming.unknownPattern,
    };
    const snapshotHash = hashSnapshot(JSON.stringify(baseSnapshot));
    const previous = db.getObservedWorktree(project.projectId, worktreeId);
    const previewSnapshot = worktreeSnapshotSchema.parse({
      ...baseSnapshot,
      lastObservedAt: observedAt,
    });
    const eventSnapshot = sanitizeWorktreeSnapshot(project, previewSnapshot);
    let lastEventSequence = previous?.lastEventSequence ?? null;

    if (previous === null) {
      const queued = db.queueEvent({
        event: {
          schemaVersion: cockpitProtocolSchemaVersion,
          eventId: randomUUID(),
          occurredAt: observedAt,
          source: 'live',
          projectId: project.projectId,
          deviceId,
          type: 'worktree_seen',
          payload: {
            worktree: eventSnapshot,
          },
        },
        source: {
          filePath: `git-worktree:${project.projectId}:${worktreeId}:seen`,
          offset: 0,
          snapshotHash,
        },
      });
      queuedSeenCount += 1;
      lastEventSequence = queued.sequence;
    } else if (previous.snapshotHash !== snapshotHash) {
      const queued = db.queueEvent({
        event: {
          schemaVersion: cockpitProtocolSchemaVersion,
          eventId: randomUUID(),
          occurredAt: observedAt,
          source: 'live',
          projectId: project.projectId,
          deviceId,
          type: 'worktree_changed',
          payload: {
            worktree: eventSnapshot,
            previousHeadSha:
              project.telemetry.git === 'full' ? previous.headSha ?? undefined : undefined,
          },
        },
        source: {
          filePath: `git-worktree:${project.projectId}:${worktreeId}:changed`,
          offset: 0,
          snapshotHash,
        },
      });
      queuedChangedCount += 1;
      lastEventSequence = queued.sequence;
    }

    db.upsertObservedWorktree({
      projectId: project.projectId,
      worktreeId,
      repoRootPath,
      worktreePath: rawWorktree.worktreePath,
      branch: rawWorktree.branch,
      headSha: rawWorktree.headSha,
      isDirty: status.isDirty,
      untrackedCount: status.untrackedCount,
      aheadCount: upstream?.aheadCount ?? null,
      behindCount: upstream?.behindCount ?? null,
      snapshotHash,
      observedAt,
      changedAt: previous?.snapshotHash === snapshotHash ? previous.lastChangedAt : observedAt,
      lastEventSequence,
    });

    worktrees.push({
      worktreeId,
      repoRootPath,
      worktreePath: rawWorktree.worktreePath,
      relativeWorktreePath: naming.relativeWorktreePath,
      displayName: naming.displayName,
      groupName: naming.groupName,
      branch: rawWorktree.branch,
      branchUpstream: upstream,
      headSha: rawWorktree.headSha,
      isDirty: status.isDirty,
      untrackedCount: status.untrackedCount,
      stagedCount: status.stagedCount,
      unstagedCount: status.unstagedCount,
      aheadCount: upstream?.aheadCount ?? null,
      behindCount: upstream?.behindCount ?? null,
      defaultBranch: defaultBranchDivergence.defaultBranch,
      defaultAheadCount: defaultBranchDivergence.aheadCount,
      defaultBehindCount: defaultBranchDivergence.behindCount,
      isDetached: rawWorktree.isDetached,
      unknownPattern: naming.unknownPattern,
      lastObservedAt: observedAt,
      snapshotHash,
      eventSnapshot,
      previewSnapshot,
      attentionReasons: collectAttentionReasons({
        isDirty: status.isDirty,
        untrackedCount: status.untrackedCount,
        stagedCount: status.stagedCount,
        unstagedCount: status.unstagedCount,
        aheadCount: upstream?.aheadCount ?? null,
        behindCount: upstream?.behindCount ?? null,
        hasUpstream: upstream !== null,
        isDetached: rawWorktree.isDetached,
        unknownPattern: naming.unknownPattern,
        defaultAheadCount: defaultBranchDivergence.aheadCount,
        defaultBehindCount: defaultBranchDivergence.behindCount,
      }),
    });
  }

  return {
    projectId: project.projectId,
    repoRootPath,
    worktrees,
    queuedSeenCount,
    queuedChangedCount,
  };
};

const listGitWorktrees = async (cwd: string) => {
  const { stdout } = await execGit(['worktree', 'list', '--porcelain'], cwd);
  const blocks = stdout
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return blocks.map(parsePorcelainWorktreeBlock);
};

const parsePorcelainWorktreeBlock = (block: string): RawGitWorktree => {
  const worktreePath = readRequiredPorcelainField(block, 'worktree');
  const headSha = readPorcelainField(block, 'HEAD');
  const branchRef = readPorcelainField(block, 'branch');

  return {
    worktreePath,
    headSha: headSha ? shortenSha(headSha) : null,
    branch: branchRef ? branchRef.replace(/^refs\/heads\//, '') : null,
    isDetached: block.split('\n').some((line) => line.trim() === 'detached'),
  };
};

const readPorcelainField = (block: string, name: string) => {
  const prefix = `${name} `;
  const line = block.split('\n').find((entry) => entry.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : null;
};

const readRequiredPorcelainField = (block: string, name: string) => {
  const value = readPorcelainField(block, name);

  if (value === null || value.length === 0) {
    throw new Error(`Missing git worktree ${name} field.`);
  }

  return value;
};

const readWorktreeStatus = async (cwd: string) => {
  const { stdout } = await execGit(['status', '--porcelain', '--untracked-files=all'], cwd);
  const lines = stdout
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  let untrackedCount = 0;
  let stagedCount = 0;
  let unstagedCount = 0;

  for (const line of lines) {
    if (line.startsWith('?? ')) {
      untrackedCount += 1;
      continue;
    }

    const indexStatus = line[0] ?? ' ';
    const worktreeStatus = line[1] ?? ' ';

    if (indexStatus !== ' ') {
      stagedCount += 1;
    }

    if (worktreeStatus !== ' ') {
      unstagedCount += 1;
    }
  }

  return {
    isDirty: lines.length > 0,
    untrackedCount,
    stagedCount,
    unstagedCount,
  };
};

const readBranchUpstream = async (cwd: string): Promise<BranchUpstream | null> => {
  let trackingBranch: string | null = null;

  try {
    const { stdout } = await execGit(
      ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'],
      cwd,
    );
    trackingBranch = stdout.trim() || null;
  } catch {
    return null;
  }

  const { stdout } = await execGit(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], cwd);
  const [behindRaw = '0', aheadRaw = '0'] = stdout.trim().split(/\s+/);
  const [remoteName, ...remoteBranchParts] = (trackingBranch ?? '').split('/');
  const remoteBranch = remoteBranchParts.length > 0 ? remoteBranchParts.join('/') : null;

  return {
    trackingBranch,
    remoteName: remoteName || null,
    remoteBranch,
    aheadCount: Number.parseInt(aheadRaw, 10),
    behindCount: Number.parseInt(behindRaw, 10),
  } satisfies BranchUpstream;
};

const readDefaultBranchDivergence = async (
  cwd: string,
  preferredRemoteName: string | null,
): Promise<DefaultBranchDivergence> => {
  const remoteName = preferredRemoteName ?? (await readFallbackRemoteName(cwd));

  if (remoteName === null) {
    return {
      defaultBranch: null,
      aheadCount: null,
      behindCount: null,
    };
  }

  const defaultBranchRef = await readRemoteDefaultBranchRef(cwd, remoteName);

  if (defaultBranchRef === null) {
    return {
      defaultBranch: null,
      aheadCount: null,
      behindCount: null,
    };
  }

  const { aheadCount, behindCount } = await readRevisionDivergence(cwd, defaultBranchRef);

  return {
    defaultBranch: defaultBranchRef,
    aheadCount,
    behindCount,
  };
};

const resolveRepoRootPath = async (cwd: string) => {
  try {
    const { stdout } = await execGit(['rev-parse', '--path-format=absolute', '--git-common-dir'], cwd);
    return path.dirname(stdout.trim());
  } catch {
    return null;
  }
};

const execGit = async (args: string[], cwd: string) =>
  execFileAsync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: '0',
    },
  });

const resolveConfiguredWorktreeRoot = (project: MappedProject, repoRootPath: string | null) => {
  const configuredRoot = project.worktreeRootPath;

  if (!configuredRoot) {
    return repoRootPath ?? project.localRootPath;
  }

  if (path.isAbsolute(configuredRoot)) {
    return path.normalize(configuredRoot);
  }

  return path.resolve(repoRootPath ?? project.localRootPath, configuredRoot);
};

const deriveWorktreeNaming = (
  project: MappedProject,
  worktree: RawGitWorktree,
  worktreeRootPath: string,
  upstream: BranchUpstream | null,
  deviceId: string,
): WorktreeNaming => {
  const relativeWorktreePath = path.relative(worktreeRootPath, worktree.worktreePath) || '.';
  const normalizedRelativePath = relativeWorktreePath.split(path.sep).join('/');
  const pathSegments = normalizedRelativePath
    .split('/')
    .filter((segment) => segment.length > 0 && segment !== '.');
  const outsideConfiguredRoot =
    normalizedRelativePath === '..' || normalizedRelativePath.startsWith(`..${path.posix.sep}`);
  const directoryGroup = outsideConfiguredRoot ? null : pathSegments[0] ?? null;
  const branchLabel = worktree.branch ?? 'detached';
  const fallbackGroup = deriveFallbackGroup(project, directoryGroup, branchLabel, deviceId);
  const templateValues = {
    branch: branchLabel,
    directory: directoryGroup ?? path.basename(worktree.worktreePath),
    device: deviceId,
    group: fallbackGroup,
    path: normalizedRelativePath,
    remote: upstream?.remoteName ?? '',
    remoteBranch: upstream?.remoteBranch ?? '',
    trackingBranch: upstream?.trackingBranch ?? '',
    worktree: path.basename(worktree.worktreePath),
  };
  const renderedGroup = renderTemplate(project.observation.worktrees.groupNameTemplate, templateValues);
  const groupName = renderedGroup.value ?? fallbackGroup;
  const renderedDisplay = renderTemplate(project.observation.worktrees.nameTemplate, {
    ...templateValues,
    group: groupName,
  });
  const fallbackDisplay =
    worktree.branch ?? (directoryGroup ? `${directoryGroup}/${path.basename(worktree.worktreePath)}` : path.basename(worktree.worktreePath));

  return {
    relativeWorktreePath: normalizedRelativePath,
    displayName: renderedDisplay.value ?? fallbackDisplay,
    groupName,
    unknownPattern: outsideConfiguredRoot || !renderedGroup.complete || !renderedDisplay.complete,
  };
};

const deriveFallbackGroup = (
  project: MappedProject,
  directoryGroup: string | null,
  branchLabel: string,
  deviceId: string,
) => {
  switch (project.observation.worktrees.groupBy) {
    case 'directory':
      return directoryGroup ?? 'unknown';
    case 'device':
      return deviceId;
    case 'custom':
      return directoryGroup ?? branchLabel;
    case 'branch':
    default:
      return branchLabel;
  }
};

const renderTemplate = (
  template: string,
  values: Record<string, string>,
): { value: string | null; complete: boolean } => {
  let complete = true;
  const rendered = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => {
    const value = values[key];

    if (!value) {
      complete = false;
      return '';
    }

    return value;
  });
  const normalized = rendered.replace(/\s+/g, ' ').trim();

  if (normalized.length === 0) {
    return {
      value: null,
      complete: false,
    };
  }

  return {
    value: normalized,
    complete,
  };
};

const sanitizeWorktreeSnapshot = (project: MappedProject, snapshot: WorktreeSnapshot): WorktreeSnapshot =>
  worktreeSnapshotSchema.parse({
    worktreeId: snapshot.worktreeId,
    repoRootPath: sanitizePathForTelemetry(
      project.telemetry.repoRootPath,
      snapshot.repoRootPath ?? null,
      project.localRootPath,
    ),
    worktreePath: sanitizePathForTelemetry(
      project.telemetry.worktreePath,
      snapshot.worktreePath ?? null,
      project.localRootPath,
    ),
    displayName: project.telemetry.git === 'off' ? undefined : snapshot.displayName,
    groupName: project.telemetry.git === 'off' ? undefined : snapshot.groupName,
    branch: project.telemetry.git === 'off' ? undefined : snapshot.branch,
    branchUpstream: sanitizeBranchUpstream(project, snapshot.branchUpstream ?? null),
    headSha: project.telemetry.git === 'full' ? snapshot.headSha : undefined,
    isDirty: snapshot.isDirty,
    untrackedCount: snapshot.untrackedCount,
    aheadCount: project.telemetry.git === 'full' ? snapshot.aheadCount : undefined,
    behindCount: project.telemetry.git === 'full' ? snapshot.behindCount : undefined,
    lastObservedAt: snapshot.lastObservedAt,
  });

const sanitizeBranchUpstream = (
  project: MappedProject,
  branchUpstream: BranchUpstream | null,
): BranchUpstream | undefined => {
  if (project.telemetry.git === 'off' || branchUpstream === null) {
    return undefined;
  }

  return {
    remoteName: branchUpstream.remoteName ?? undefined,
    remoteBranch: branchUpstream.remoteBranch ?? undefined,
    trackingBranch: branchUpstream.trackingBranch ?? undefined,
    aheadCount: project.telemetry.git === 'full' ? branchUpstream.aheadCount ?? undefined : undefined,
    behindCount: project.telemetry.git === 'full' ? branchUpstream.behindCount ?? undefined : undefined,
  };
};

const sanitizePathForTelemetry = (
  mode: TelemetryProfile['worktreePath'],
  value: string | null,
  relativeRoot: string,
) => {
  if (value === null) {
    return undefined;
  }

  switch (mode) {
    case 'off':
      return undefined;
    case 'basename':
      return path.basename(value);
    case 'relative': {
      const relativePath = path.relative(relativeRoot, value);
      return relativePath.length > 0 ? relativePath : '.';
    }
    case 'full':
      return value;
  }
};

const createWorktreeId = (projectId: string, worktreePath: string) =>
  `wt_${hashSnapshot(`${projectId}:${path.resolve(worktreePath)}`).slice(0, 16)}`;

const shortenSha = (sha: string) => sha.slice(0, 7);

const collectAttentionReasons = (input: {
  isDirty: boolean;
  untrackedCount: number;
  stagedCount: number;
  unstagedCount: number;
  aheadCount: number | null;
  behindCount: number | null;
  hasUpstream: boolean;
  isDetached: boolean;
  unknownPattern: boolean;
  defaultAheadCount: number | null;
  defaultBehindCount: number | null;
}) => {
  const reasons: string[] = [];

  if (input.isDirty) {
    reasons.push(input.untrackedCount > 0 ? 'dirty+untracked' : 'dirty');
  } else if (input.untrackedCount > 0) {
    reasons.push('untracked');
  }

  if ((input.aheadCount ?? 0) > 0) {
    reasons.push('ahead');
  }

  if ((input.behindCount ?? 0) > 0) {
    reasons.push('behind');
  }

  if (input.stagedCount > 0) {
    reasons.push('staged');
  }

  if (input.unstagedCount > 0) {
    reasons.push('unstaged');
  }

  if (!input.hasUpstream && !input.isDetached) {
    reasons.push('no-upstream');
  }

  if (input.isDetached) {
    reasons.push('detached');
  }

  if ((input.defaultAheadCount ?? 0) > 0 || (input.defaultBehindCount ?? 0) > 0) {
    reasons.push('default-diverged');
  }

  if (input.unknownPattern) {
    reasons.push('unknown-pattern');
  }

  return reasons;
};

const readFallbackRemoteName = async (cwd: string) => {
  try {
    const { stdout } = await execGit(['remote'], cwd);
    const [firstRemote] = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return firstRemote ?? null;
  } catch {
    return null;
  }
};

const readRemoteDefaultBranchRef = async (cwd: string, remoteName: string) => {
  try {
    const { stdout } = await execGit(['symbolic-ref', `refs/remotes/${remoteName}/HEAD`], cwd);
    const ref = stdout.trim();

    if (ref.length === 0) {
      return null;
    }

    return ref.replace(/^refs\/remotes\//, '');
  } catch {
    return null;
  }
};

const readRevisionDivergence = async (cwd: string, ref: string) => {
  try {
    const { stdout } = await execGit(['rev-list', '--left-right', '--count', `${ref}...HEAD`], cwd);
    const [behindRaw = '0', aheadRaw = '0'] = stdout.trim().split(/\s+/);

    return {
      aheadCount: Number.parseInt(aheadRaw, 10),
      behindCount: Number.parseInt(behindRaw, 10),
    };
  } catch {
    return {
      aheadCount: null,
      behindCount: null,
    };
  }
};
