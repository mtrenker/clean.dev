import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { mappedProjectSchema } from '@cleandev/cockpit-protocol';
import { afterEach, describe, expect, it } from 'vitest';

import { scanProjectGitWorktrees } from './adapters/git';
import { resolveDaemonPaths } from './config';
import { openLocalDaemonDb } from './local-db';

const execFileAsync = promisify(execFile);
const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true });
  }
});

describe('git worktree adapter', () => {
  it('captures clean, dirty, ahead, behind, no-upstream, detached, and unknown-pattern worktrees', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-git-'));
    tempDirs.push(root);
    const workspace = await createWorkspace(root);
    const db = await openLocalDaemonDb(resolveDaemonPaths(path.join(root, 'daemon-config.json')));

    try {
      const scan = await scanProjectGitWorktrees(db, workspace.project, 'device-1');

      expect(scan.queuedSeenCount).toBe(5);
      expect(scan.queuedChangedCount).toBe(0);
      expect(scan.worktrees).toHaveLength(5);

      const dirtyMain = findWorktree(scan, 'main');
      expect(dirtyMain.isDirty).toBe(true);
      expect(dirtyMain.untrackedCount).toBe(1);
      expect(dirtyMain.stagedCount).toBe(1);
      expect(dirtyMain.unstagedCount).toBe(1);
      expect(dirtyMain.unknownPattern).toBe(true);
      expect(dirtyMain.groupName).toBe('unknown');
      expect(dirtyMain.eventSnapshot.worktreePath).toBe('.');
      expect(dirtyMain.previewSnapshot.worktreePath).toBe(workspace.repoPath);
      expect(dirtyMain.eventSnapshot.repoRootPath).toBeUndefined();
      expect(dirtyMain.attentionReasons).toContain('unknown-pattern');

      const ahead = findWorktree(scan, 'feature-ahead');
      expect(ahead.displayName).toBe('feature-ahead@device-1');
      expect(ahead.groupName).toBe('feature');
      expect(ahead.relativeWorktreePath).toBe('feature/ahead');
      expect(ahead.branchUpstream?.trackingBranch).toBe('origin/feature-ahead');
      expect(ahead.branchUpstream?.remoteName).toBe('origin');
      expect(ahead.aheadCount).toBeGreaterThan(0);
      expect(ahead.behindCount).toBe(0);
      expect(ahead.defaultBranch).toBe('origin/main');
      expect(ahead.defaultAheadCount).toBeGreaterThan(0);
      expect(ahead.eventSnapshot.worktreePath).toBe('../managed/feature/ahead');
      expect(ahead.eventSnapshot.displayName).toBe('feature-ahead@device-1');
      expect(ahead.eventSnapshot.groupName).toBe('feature');

      const behind = findWorktree(scan, 'feature-behind');
      expect(behind.aheadCount).toBe(0);
      expect(behind.behindCount).toBeGreaterThan(0);
      expect(behind.branchUpstream?.trackingBranch).toBe('origin/feature-behind');
      expect(behind.attentionReasons).toContain('behind');

      const localOnly = findWorktree(scan, 'local-only');
      expect(localOnly.isDirty).toBe(false);
      expect(localOnly.branchUpstream).toBeNull();
      expect(localOnly.aheadCount).toBeNull();
      expect(localOnly.behindCount).toBeNull();
      expect(localOnly.groupName).toBe('scratch');
      expect(localOnly.attentionReasons).toContain('no-upstream');

      const detached = scan.worktrees.find((entry) => entry.isDetached);
      expect(detached).toBeDefined();
      expect(detached?.branch).toBeNull();
      expect(detached?.branchUpstream).toBeNull();
      expect(detached?.displayName).toBe('detached@device-1');
      expect(detached?.attentionReasons).toContain('detached');
    } finally {
      db.close();
    }
  });

  it('queues changed events with previous head sha and only emits absolute paths when telemetry allows them', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-git-redaction-'));
    tempDirs.push(root);
    const workspace = await createWorkspace(root, {
      telemetry: {
        worktreePath: 'full',
        repoRootPath: 'full',
        git: 'full',
        progressText: false,
        usage: true,
        planText: true,
        taskDescription: true,
      },
    });
    const db = await openLocalDaemonDb(resolveDaemonPaths(path.join(root, 'daemon-config.json')));

    try {
      const firstScan = await scanProjectGitWorktrees(db, workspace.project, 'device-1');
      const ahead = findWorktree(firstScan, 'feature-ahead');

      expect(ahead.eventSnapshot.worktreePath).toBe(workspace.featureAheadWorktreePath);
      expect(ahead.eventSnapshot.repoRootPath).toBe(workspace.repoPath);
      expect(ahead.eventSnapshot.headSha).toBeTruthy();

      const previousHeadSha = ahead.headSha;
      await writeFile(path.join(workspace.featureAheadWorktreePath, 'feature-ahead.txt'), 'base\nahead\nagain\n', 'utf8');
      await runGit(['commit', '-am', 'feature ahead again'], workspace.featureAheadWorktreePath);

      const secondScan = await scanProjectGitWorktrees(db, workspace.project, 'device-1');

      expect(secondScan.queuedSeenCount).toBe(0);
      expect(secondScan.queuedChangedCount).toBeGreaterThanOrEqual(1);

      const changedEvents = db
        .listPendingOutboundEvents()
        .filter((entry) => entry.event.type === 'worktree_changed');

      expect(changedEvents).toHaveLength(1);
      expect(changedEvents[0]?.event.payload.previousHeadSha).toBe(previousHeadSha);
    } finally {
      db.close();
    }
  });
});

const createWorkspace = async (
  root: string,
  options?: {
    telemetry?: {
      worktreePath: 'off' | 'basename' | 'relative' | 'full';
      repoRootPath: 'off' | 'basename' | 'relative' | 'full';
      git: 'off' | 'branch-only' | 'full';
      progressText: boolean;
      usage: boolean;
      planText: boolean;
      taskDescription: boolean;
    };
  },
) => {
  const remotePath = path.join(root, 'remote.git');
  const repoPath = path.join(root, 'repo');
  const collaboratorPath = path.join(root, 'collaborator');
  const managedRoot = path.join(root, 'managed');
  const featureAheadWorktreePath = path.join(managedRoot, 'feature', 'ahead');
  const featureBehindWorktreePath = path.join(managedRoot, 'feature', 'behind');
  const localOnlyWorktreePath = path.join(managedRoot, 'scratch', 'local-only');
  const detachedWorktreePath = path.join(root, 'detached-outside');

  await mkdir(path.join(managedRoot, 'feature'), { recursive: true });
  await mkdir(path.join(managedRoot, 'scratch'), { recursive: true });

  await runGit(['init', '--bare', remotePath], root);
  await runGit(['clone', remotePath, repoPath], root);
  await configureGitIdentity(repoPath);
  await writeFile(path.join(repoPath, 'README.md'), '# test\n', 'utf8');
  await runGit(['add', 'README.md'], repoPath);
  await runGit(['commit', '-m', 'initial'], repoPath);
  await runGit(['branch', '-M', 'main'], repoPath);
  await runGit(['push', '-u', 'origin', 'main'], repoPath);
  await runGit(['remote', 'set-head', 'origin', '-a'], repoPath);
  await runGit(['checkout', '-b', 'feature-ahead'], repoPath);
  await writeFile(path.join(repoPath, 'feature-ahead.txt'), 'base\n', 'utf8');
  await runGit(['add', 'feature-ahead.txt'], repoPath);
  await runGit(['commit', '-m', 'feature ahead base'], repoPath);
  await runGit(['push', '-u', 'origin', 'feature-ahead'], repoPath);
  await runGit(['checkout', 'main'], repoPath);
  await runGit(['worktree', 'add', featureAheadWorktreePath, 'feature-ahead'], repoPath);
  await writeFile(path.join(featureAheadWorktreePath, 'feature-ahead.txt'), 'base\nahead\n', 'utf8');
  await runGit(['commit', '-am', 'feature ahead'], featureAheadWorktreePath);

  await runGit(['checkout', '-b', 'feature-behind'], repoPath);
  await writeFile(path.join(repoPath, 'feature-behind.txt'), 'base\n', 'utf8');
  await runGit(['add', 'feature-behind.txt'], repoPath);
  await runGit(['commit', '-m', 'feature behind base'], repoPath);
  await runGit(['push', '-u', 'origin', 'feature-behind'], repoPath);
  await runGit(['checkout', 'main'], repoPath);
  await runGit(['worktree', 'add', featureBehindWorktreePath, 'feature-behind'], repoPath);

  await runGit(['checkout', '-b', 'local-only'], repoPath);
  await writeFile(path.join(repoPath, 'local-only.txt'), 'base\n', 'utf8');
  await runGit(['add', 'local-only.txt'], repoPath);
  await runGit(['commit', '-m', 'local only'], repoPath);
  await runGit(['checkout', 'main'], repoPath);
  await runGit(['worktree', 'add', localOnlyWorktreePath, 'local-only'], repoPath);

  await runGit(['worktree', 'add', '--detach', detachedWorktreePath, 'HEAD'], repoPath);

  await runGit(['clone', remotePath, collaboratorPath], root);
  await configureGitIdentity(collaboratorPath);
  await runGit(['checkout', 'feature-behind'], collaboratorPath);
  await writeFile(path.join(collaboratorPath, 'feature-behind.txt'), 'base\nremote\n', 'utf8');
  await runGit(['commit', '-am', 'remote behind commit'], collaboratorPath);
  await runGit(['push', 'origin', 'feature-behind'], collaboratorPath);
  await runGit(['fetch', 'origin'], repoPath);

  await writeFile(path.join(repoPath, 'staged.txt'), 'staged\n', 'utf8');
  await runGit(['add', 'staged.txt'], repoPath);
  await writeFile(path.join(repoPath, 'README.md'), '# test\nmodified\n', 'utf8');
  await writeFile(path.join(repoPath, 'untracked.txt'), 'untracked\n', 'utf8');

  return {
    repoPath,
    featureAheadWorktreePath,
    project: mappedProjectSchema.parse({
      projectId: 'project-1',
      localRootPath: repoPath,
      worktreeRootPath: path.relative(repoPath, managedRoot),
      observation: {
        staleAfterMs: 60_000,
        includeArchived: true,
        worktrees: {
          nameTemplate: '{branch}@{device}',
          groupBy: 'directory',
          groupNameTemplate: '{group}',
        },
      },
      telemetry: options?.telemetry ?? {
        worktreePath: 'relative',
        repoRootPath: 'off',
        git: 'full',
        progressText: false,
        usage: true,
        planText: true,
        taskDescription: true,
      },
    }),
  };
};

const configureGitIdentity = async (cwd: string) => {
  await runGit(['config', 'user.email', 'daemon-tests@example.com'], cwd);
  await runGit(['config', 'user.name', 'Daemon Tests'], cwd);
};

const findWorktree = (
  scan: Awaited<ReturnType<typeof scanProjectGitWorktrees>>,
  branch: string,
) => {
  const worktree = scan.worktrees.find((entry) => entry.branch === branch);

  if (!worktree) {
    throw new Error(`Missing worktree for branch ${branch}`);
  }

  return worktree;
};

const runGit = async (args: string[], cwd: string) => {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: '0',
    },
  });

  return stdout;
};
