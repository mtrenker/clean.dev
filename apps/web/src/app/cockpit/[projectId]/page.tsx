import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ProjectDetail, PruneEventsForm } from '@/components/cockpit';

interface CockpitProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: CockpitProjectPageProps,
): Promise<Metadata> {
  const { projectId } = await params;
  const repo = getCockpitRepository();

  const projects = await repo.listProjects();
  const project = projects.find((p) => p.projectId === projectId);

  const displayName =
    project?.projectName ?? project?.projectSlug ?? projectId;

  return {
    title: `Cockpit — ${displayName}`,
  };
}

const CockpitProjectPage = async ({ params }: CockpitProjectPageProps) => {
  const { projectId } = await params;
  const repo = getCockpitRepository();

  // Fetch project record + projected state in parallel
  const [projects, state] = await Promise.all([
    repo.listProjects(),
    repo.getProjectedProjectState(projectId),
  ]);

  const project = projects.find((p) => p.projectId === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <ProjectDetail project={project} state={state} />

      {/* ── Operator tools section ─────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Operator tools
        </h2>
        <PruneEventsForm
          projectId={projectId}
          suggestedThroughSequence={project.latestEventSequence}
        />
      </section>
    </div>
  );
};

export default CockpitProjectPage;
