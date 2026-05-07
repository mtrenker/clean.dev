import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { runCli, type CliIo } from './cli';
import { openLocalDaemonDb } from './local-db';
import { resolveDaemonPaths } from './config';

const execFileAsync = promisify(execFile);
const tempDirs: string[] = [];

class BufferIo implements CliIo {
  readonly stdoutChunks: string[] = [];
  readonly stderrChunks: string[] = [];

  stdout(message: string) {
    this.stdoutChunks.push(message);
  }

  stderr(message: string) {
    this.stderrChunks.push(message);
  }

  flushStdout() {
    const output = this.stdoutChunks.join('');
    this.stdoutChunks.length = 0;
    return output;
  }
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true });
  }
});

describe('git worktree adapter', () => {
  it('surfaces dirty and diverged worktrees in preview and queues seen/changed events', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-git-'));
    tempDirs.push(root);
    const { repoPath, featureWorktreePath } = await createGitWorkspace(root);
    const io = new BufferIo();
    const configPath = path.join(root, 'daemon-config.json');
    const paths = resolveDaemonPaths(configPath);

    const mapExitCode = await runCli(
      [
        '--config',
        configPath,
        'map',
        '--project-id',
        'project-1',
        '--path',
        repoPath,
        '--telemetry',
        'balanced',
      ],
      io,
    );

    expect(mapExitCode).toBe(0);
    io.flushStdout();

    const firstPreviewExitCode = await runCli(
      ['--config', configPath, 'preview', '--project', 'project-1'],
      io,
    );
    const firstPreview = JSON.parse(io.flushStdout()) as {
      worktrees: Array<{
        worktree: {
          worktreePath?: string;
          repoRootPath?: string;
          aheadCount?: number | null;
          isDirty: boolean;
          untrackedCount: number;
        };
        attention: boolean;
        attentionReasons: string[];
      }>;
      scan: {
        queuedSeenCount: number;
        queuedChangedCount: number;
      };
    };

    expect(firstPreviewExitCode).toBe(0);
    expect(firstPreview.worktrees).toHaveLength(2);
    expect(firstPreview.scan.queuedSeenCount).toBe(2);
    expect(firstPreview.scan.queuedChangedCount).toBe(0);
    expect(firstPreview.worktrees.every((entry) => entry.attention)).toBe(true);
    expect(firstPreview.worktrees.map((entry) => entry.attentionReasons)).toContainEqual([
      'dirty+untracked',
    ]);
    expect(firstPreview.worktrees.map((entry) => entry.attentionReasons)).toContainEqual(['ahead']);
    expect(firstPreview.worktrees.every((entry) => path.isAbsolute(entry.worktree.worktreePath ?? ''))).toBe(
      false,
    );
    expect(firstPreview.worktrees.every((entry) => entry.worktree.repoRootPath === undefined)).toBe(true);

    {
      const db = await openLocalDaemonDb(paths);
      try {
        const state = db.getState();
        const observed = db.listObservedWorktrees('project-1');
        const eventTypes = db.listPendingOutboundEvents().map((entry) => entry.event.type);

        expect(state.observedWorktreeCount).toBe(2);
        expect(observed).toHaveLength(2);
        expect(observed.every((entry) => entry.lastObservedAt.length > 0)).toBe(true);
        expect(eventTypes).toEqual(['worktree_seen', 'worktree_seen']);
      } finally {
        db.close();
      }
    }

    const previousHeadSha = (await runGit(['rev-parse', '--short', 'HEAD'], featureWorktreePath)).trim();
    await writeFile(path.join(featureWorktreePath, 'feature.txt'), 'feature\nsecond\nthird\n', 'utf8');
    await runGit(['commit', '-am', 'feature ahead again'], featureWorktreePath);

    const secondPreviewExitCode = await runCli(
      ['--config', configPath, 'preview', '--project', 'project-1'],
      io,
    );
    const secondPreview = JSON.parse(io.flushStdout()) as {
      scan: {
        queuedSeenCount: number;
        queuedChangedCount: number;
      };
    };

    expect(secondPreviewExitCode).toBe(0);
    expect(secondPreview.scan.queuedSeenCount).toBe(0);
    expect(secondPreview.scan.queuedChangedCount).toBe(1);

    {
      const db = await openLocalDaemonDb(paths);
      try {
        const changedEvents = db
          .listPendingOutboundEvents()
          .filter((entry) => entry.event.type === 'worktree_changed');

        expect(changedEvents).toHaveLength(1);
        expect(changedEvents[0]?.event.payload.previousHeadSha).toBe(previousHeadSha);
      } finally {
        db.close();
      }
    }
  });
});

const createGitWorkspace = async (root: string) => {
  const remotePath = path.join(root, 'remote.git');
  const repoPath = path.join(root, 'repo');
  const featureWorktreePath = path.join(root, 'repo-feature');

  await runGit(['init', '--bare', remotePath], root);
  await runGit(['clone', remotePath, repoPath], root);
  await runGit(['config', 'user.email', 'daemon-tests@example.com'], repoPath);
  await runGit(['config', 'user.name', 'Daemon Tests'], repoPath);
  await writeFile(path.join(repoPath, 'README.md'), '# test\n', 'utf8');
  await runGit(['add', 'README.md'], repoPath);
  await runGit(['commit', '-m', 'initial'], repoPath);
  await runGit(['branch', '-M', 'main'], repoPath);
  await runGit(['push', '-u', 'origin', 'main'], repoPath);

  await runGit(['checkout', '-b', 'feature'], repoPath);
  await writeFile(path.join(repoPath, 'feature.txt'), 'feature\n', 'utf8');
  await runGit(['add', 'feature.txt'], repoPath);
  await runGit(['commit', '-m', 'feature base'], repoPath);
  await runGit(['push', '-u', 'origin', 'feature'], repoPath);
  await runGit(['checkout', 'main'], repoPath);
  await runGit(['worktree', 'add', featureWorktreePath, 'feature'], repoPath);

  await writeFile(path.join(featureWorktreePath, 'feature.txt'), 'feature\nsecond\n', 'utf8');
  await runGit(['commit', '-am', 'feature ahead'], featureWorktreePath);
  await writeFile(path.join(repoPath, 'dirty.txt'), 'dirty\n', 'utf8');

  return {
    repoPath,
    featureWorktreePath,
  };
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
