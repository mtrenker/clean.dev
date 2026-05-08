import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ArchiveRunsIndex } from '@/components/cockpit/project';
import { buildArchiveRunRows } from '@/lib/cockpit/archive-detail';

interface CockpitRunsPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitRunsPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const project = await repo.getProject(projectId);
  const displayName =
    project?.projectName ?? project?.projectSlug ?? projectId;
  return { title: `Cockpit — Runs · ${displayName}` };
}

const CockpitRunsPage = async ({ params }: CockpitRunsPageProps) => {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const [project, state] = await Promise.all([
    repo.getProject(projectId),
    repo.getProjectedProjectState(projectId),
  ]);
  if (!project) notFound();

  const displayName =
    state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;
  const runs = buildArchiveRunRows(state);

  return (
    <ArchiveRunsIndex
      projectId={project.projectId}
      projectName={displayName}
      runs={runs}
    />
  );
};

export default CockpitRunsPage;
