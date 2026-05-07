import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  cockpitProtocolSchemaVersion,
  worktreeSnapshotSchema,
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
}

interface GitWorktreeScan {
  worktreeId: string;
  repoRootPath: string | null;
  worktreePath: string;
  branch: string | null;
  headSha: string | null;
  isDirty: boolean;
  untrackedCount: number;
  aheadCount: number | null;
  behindCount: number | null;
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
  const rawWorktrees = await listGitWorktrees(project.localRootPath);
  const observedAt = new Date().toISOString();
  let queuedSeenCount = 0;
  let queuedChangedCount = 0;

  const worktrees: GitWorktreeScan[] = [];

  for (const rawWorktree of rawWorktrees) {
    const status = await readWorktreeStatus(rawWorktree.worktreePath);
    const aheadBehind =
      rawWorktree.branch === null
        ? { aheadCount: null, behindCount: null }
        : await readAheadBehind(rawWorktree.worktreePath);
    const worktreeId = createWorktreeId(project.projectId, rawWorktree.worktreePath);
    const baseSnapshot = {
      worktreeId,
      repoRootPath,
      worktreePath: rawWorktree.worktreePath,
      branch: rawWorktree.branch,
      headSha: rawWorktree.headSha,
      isDirty: status.isDirty,
      untrackedCount: status.untrackedCount,
      aheadCount: aheadBehind.aheadCount,
      behindCount: aheadBehind.behindCount,
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
      aheadCount: aheadBehind.aheadCount,
      behindCount: aheadBehind.behindCount,
      snapshotHash,
      observedAt,
      changedAt: previous?.snapshotHash === snapshotHash ? previous.lastChangedAt : observedAt,
      lastEventSequence,
    });

    worktrees.push({
      worktreeId,
      repoRootPath,
      worktreePath: rawWorktree.worktreePath,
      branch: rawWorktree.branch,
      headSha: rawWorktree.headSha,
      isDirty: status.isDirty,
      untrackedCount: status.untrackedCount,
      aheadCount: aheadBehind.aheadCount,
      behindCount: aheadBehind.behindCount,
      lastObservedAt: observedAt,
      snapshotHash,
      eventSnapshot,
      previewSnapshot,
      attentionReasons: collectAttentionReasons({
        isDirty: status.isDirty,
        untrackedCount: status.untrackedCount,
        aheadCount: aheadBehind.aheadCount,
        behindCount: aheadBehind.behindCount,
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

  return {
    isDirty: lines.length > 0,
    untrackedCount: lines.filter((line) => line.startsWith('?? ')).length,
  };
};

const readAheadBehind = async (cwd: string) => {
  try {
    await execGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], cwd);
  } catch {
    return {
      aheadCount: null,
      behindCount: null,
    };
  }

  const { stdout } = await execGit(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], cwd);
  const [behindRaw = '0', aheadRaw = '0'] = stdout.trim().split(/\s+/);

  return {
    aheadCount: Number.parseInt(aheadRaw, 10),
    behindCount: Number.parseInt(behindRaw, 10),
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
    branch: project.telemetry.git === 'off' ? undefined : snapshot.branch,
    headSha: project.telemetry.git === 'full' ? snapshot.headSha : undefined,
    isDirty: snapshot.isDirty,
    untrackedCount: snapshot.untrackedCount,
    aheadCount: project.telemetry.git === 'full' ? snapshot.aheadCount : undefined,
    behindCount: project.telemetry.git === 'full' ? snapshot.behindCount : undefined,
    lastObservedAt: snapshot.lastObservedAt,
  });

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
  aheadCount: number | null;
  behindCount: number | null;
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

  return reasons;
};
