import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ArchiveOverview } from '@/components/cockpit/project';
import {
  buildArchivedPlanRows,
  buildArchivedTaskRows,
  buildArchiveRunRows,
} from '@/lib/cockpit/archive-detail';

interface CockpitArchivePageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitArchivePageProps): Promise<Metadata> {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const project = await repo.getProject(projectId);
  const displayName =
    project?.projectName ?? project?.projectSlug ?? projectId;
  return { title: `Cockpit — Archive · ${displayName}` };
}

const CockpitArchivePage = async ({ params }: CockpitArchivePageProps) => {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const [project, state] = await Promise.all([
    repo.getProject(projectId),
    repo.getProjectedProjectState(projectId),
  ]);
  if (!project) notFound();

  const displayName =
    state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;

  const plans = buildArchivedPlanRows(state);
  const tasks = buildArchivedTaskRows(state);
  const runs = buildArchiveRunRows(state);

  return (
    <ArchiveOverview
      projectId={project.projectId}
      projectName={displayName}
      plans={plans}
      tasks={tasks}
      runs={runs}
    />
  );
};

export default CockpitArchivePage;
