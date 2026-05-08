import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Heading, Link } from '@/components/ui';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ProjectConfigForm } from '@/components/cockpit/project';

interface CockpitProjectConfigPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitProjectConfigPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const project = await repo.getProject(projectId);
  return {
    title: `Cockpit — Configure ${project?.projectName ?? project?.projectSlug ?? projectId}`,
  };
}

const CockpitProjectConfigPage = async ({
  params,
}: CockpitProjectConfigPageProps) => {
  const { projectId } = await params;
  const repo = getCockpitRepository();
  const project = await repo.getProject(projectId);
  if (!project) notFound();

  const displayName =
    project.projectName ?? project.projectSlug ?? project.projectId;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${project.projectId}`} variant="muted">
            ← {displayName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">configure</span>
        </div>
        <div>
          <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
            Project observation
          </Heading>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Configure how daemons observe this project — branch grouping,
            worktree naming patterns, telemetry profile and stale-after
            window. Changes take effect on the next daemon observation cycle.
          </p>
        </div>
      </header>

      <ProjectConfigForm
        projectId={project.projectId}
        initialWorktreeRootPath={project.worktreeRootPath ?? null}
        initialObservation={project.observation ?? null}
        initialTelemetry={project.telemetry ?? null}
      />
    </div>
  );
};

export default CockpitProjectConfigPage;
