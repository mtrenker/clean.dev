---
name: worktree-setup
description: >
  Git worktree lifecycle management for parallel fleet work. Use when creating,
  provisioning, listing, or tearing down worktrees for fleet-planner or
  fleet-worker agents. Keywords: worktree, provision, parallel, fleet, setup,
  cleanup, pnpm install, env copy.
---

# Worktree Setup

Manage git worktrees used by the fleet system for parallel implementation streams.
Each worktree is a fully independent working copy with its own branch, `node_modules`,
and environment files.

## Conventions

- **Location**: Sibling directories of the main repo: `../{repo-name}-wt-{slug}/`
- **Branch prefix**: `fleet/{task-slug}/{stream-slug}`
- **Repo name**: Derived from `basename $(git rev-parse --show-toplevel)`

## Procedures

### Create a Worktree

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
WORKTREE_DIR="${REPO_ROOT}/../${REPO_NAME}-wt-{slug}"
BRANCH="fleet/{task-slug}/{stream-slug}"

# Create worktree with new branch from current HEAD
git worktree add "$WORKTREE_DIR" -b "$BRANCH"
```

Replace `{slug}`, `{task-slug}`, and `{stream-slug}` with kebab-case identifiers.

### Provision a Worktree

After creating the worktree, it needs environment files and dependencies installed.
Run these steps from the **main repo root** (where the `.env` files live):

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
WORKTREE_DIR="${REPO_ROOT}/../${REPO_NAME}-wt-{slug}"

# 1. Copy root env file (used by dotenv-cli for all scripts)
[[ -f "$REPO_ROOT/.env" ]] && cp "$REPO_ROOT/.env" "$WORKTREE_DIR/.env"

# 2. Copy app-level env overrides if they exist
[[ -f "$REPO_ROOT/apps/web/.env.local" ]] && cp "$REPO_ROOT/apps/web/.env.local" "$WORKTREE_DIR/apps/web/.env.local"

# 3. Copy any other .env* files at root (e.g. .envrc)
for f in "$REPO_ROOT"/.env*; do
  [[ -f "$f" ]] && cp "$f" "$WORKTREE_DIR/$(basename "$f")"
done

# 4. Install dependencies in the worktree
cd "$WORKTREE_DIR" && pnpm install --frozen-lockfile
```

**Important**: Use `--frozen-lockfile` to ensure reproducible installs matching the lockfile.

### Verify a Worktree

After provisioning, verify the worktree is functional:

```bash
cd "$WORKTREE_DIR"

# Quick smoke test — TypeScript compilation
pnpm build
```

### List Active Worktrees

```bash
git worktree list
```

### Teardown a Worktree

Remove a worktree and optionally its branch. Run from the **main repo**:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
WORKTREE_DIR="${REPO_ROOT}/../${REPO_NAME}-wt-{slug}"

# Remove the worktree (--force if it has uncommitted changes)
git worktree remove "$WORKTREE_DIR"

# Optionally delete the local branch
git branch -D "fleet/{task-slug}/{stream-slug}"

# Optionally delete the remote branch (after PR is merged)
git push origin --delete "fleet/{task-slug}/{stream-slug}"
```

### Teardown All Fleet Worktrees

Remove all worktrees and branches created by the fleet system:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)

# List and remove all fleet worktrees
git worktree list --porcelain | grep -B2 "branch refs/heads/fleet/" | grep "worktree " | sed 's/worktree //' | while read -r wt; do
  git worktree remove "$wt" --force
done

# Prune stale worktree refs
git worktree prune

# Delete all local fleet branches
git branch --list 'fleet/*' | xargs -r git branch -D
```

## Troubleshooting

- **"fatal: '{branch}' is already checked out"**: The branch is already used by another worktree. Use `git worktree list` to find it, or choose a different branch name.
- **pnpm install fails**: Ensure `pnpm-lock.yaml` is present in the worktree. If the worktree was created from a branch that's behind `main`, the lockfile may be outdated — rebase first.
- **Missing env vars at runtime**: Verify `.env` was copied to the worktree root (not just `apps/web/`). The `dotenv-cli` scripts load from root `.env`.
