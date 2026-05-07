import { createCockpitRepository, type ICockpitRepository } from '@cleandev/cockpit-store';
import { getPool } from './db';

let repo: ICockpitRepository | null = null;

/**
 * Returns a lazily-created singleton cockpit repository backed by the shared
 * Postgres connection pool.  Re-creating the repository on every request is
 * safe but wasteful; the singleton avoids that overhead without introducing a
 * module-level async initialisation that doesn't play well with Next.js cold
 * starts.
 */
export function getCockpitRepository(): ICockpitRepository {
  if (!repo) {
    repo = createCockpitRepository(getPool());
  }
  return repo;
}
