import React from 'react';
import type {
  CockpitProjectRecord,
  CockpitProjectedProjectState,
} from '@cleandev/cockpit-store';
import { Badge, EmptyState } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import { ProjectCard } from './project-card';

interface ProjectHealthGridProps {
  projects: CockpitProjectRecord[];
  stateMap: Map<string, CockpitProjectedProjectState | null>;
  hrefBase?: string;
}

/**
 * Compact summary of every project in the fleet — preserves the existing
 * `ProjectCard` view from the previous overview page but wraps it in the new
 * `ConsolePanel` chrome so the section reads as a fleet manifest.
 */
export const ProjectHealthGrid: React.FC<ProjectHealthGridProps> = ({
  projects,
  stateMap,
  hrefBase = '/cockpit',
}) => {
  // Sort: active first, then offline/stale, then alphabetical.
  const sorted = [...projects].sort((a, b) => {
    const sa = stateMap.get(a.projectId);
    const sb = stateMap.get(b.projectId);
    const aActive = sa && !sa.dirty ? 0 : 1;
    const bActive = sb && !sb.dirty ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const aName = sa?.projectName ?? a.projectName ?? a.projectSlug ?? a.projectId;
    const bName = sb?.projectName ?? b.projectName ?? b.projectSlug ?? b.projectId;
    return aName.localeCompare(bName);
  });

  return (
    <ConsolePanel
      title="Project health"
      command="cockpit projects ls"
      meta={
        projects.length > 0 ? (
          <Badge variant="muted">
            {projects.length} project{projects.length === 1 ? '' : 's'}
          </Badge>
        ) : null
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="No cockpit projects have been registered yet. Pair a daemon device to start receiving events."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              state={stateMap.get(project.projectId) ?? null}
              hrefBase={hrefBase}
            />
          ))}
        </div>
      )}
    </ConsolePanel>
  );
};
