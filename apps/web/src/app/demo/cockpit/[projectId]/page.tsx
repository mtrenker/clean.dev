import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/cockpit';
import { getDemoCockpitProject } from '@/lib/cockpit';
import { DemoAutoRefresh } from '../demo-auto-refresh';

interface DemoCockpitProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: DemoCockpitProjectPageProps,
): Promise<Metadata> {
  const { projectId } = await params;
  const demoProject = getDemoCockpitProject(projectId);

  return {
    title: `Cockpit Demo — ${demoProject?.project.projectName ?? projectId}`,
  };
}

const DemoCockpitProjectPage = async ({ params }: DemoCockpitProjectPageProps) => {
  const { projectId } = await params;
  const demoProject = getDemoCockpitProject(projectId);

  if (!demoProject) {
    notFound();
  }

  return (
    <>
      <DemoAutoRefresh />
      <ProjectDetail
        project={demoProject.project}
        state={demoProject.state}
        backHref="/demo/cockpit"
      />
    </>
  );
};

export default DemoCockpitProjectPage;
