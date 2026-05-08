import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ArchiveRunDetail } from '@/components/cockpit/project';
import { findArchiveRun } from '@/lib/cockpit/archive-detail';

interface CockpitRunPageProps {
  params: Promise<{ projectId: string; runId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitRunPageProps): Promise<Metadata> {
  const { projectId, runId } = await params;
  return { title: `Cockpit — Run · ${runId} · ${projectId}` };
}

const CockpitRunPage = async ({ params }: CockpitRunPageProps) => {
  const { projectId, runId } = await params;
  const repo = getCockpitRepository();
  const [project, state] = await Promise.all([
    repo.getProject(projectId),
    repo.getProjectedProjectState(projectId),
  ]);
  if (!project) notFound();

  const run = findArchiveRun(state, runId);
  if (!run) notFound();

  const displayName =
    state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;

  return (
    <ArchiveRunDetail
      projectId={project.projectId}
      projectName={displayName}
      run={run}
    />
  );
};

export default CockpitRunPage;
