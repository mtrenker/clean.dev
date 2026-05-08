import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { ArchivedPlanDetailView } from '@/components/cockpit/project';
import {
  isArchivedPlan,
  tasksForPlan,
} from '@/lib/cockpit/archive-detail';
import { findPlan } from '@/lib/cockpit/project-detail';

interface CockpitPlanPageProps {
  params: Promise<{ projectId: string; planId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitPlanPageProps): Promise<Metadata> {
  const { projectId, planId } = await params;
  const repo = getCockpitRepository();
  const state = await repo.getProjectedProjectState(projectId);
  const plan = findPlan(state, planId);
  return { title: `Cockpit — ${plan?.title ?? planId}` };
}

const CockpitPlanPage = async ({ params }: CockpitPlanPageProps) => {
  const { projectId, planId } = await params;
  const repo = getCockpitRepository();
  const state = await repo.getProjectedProjectState(projectId);

  const plan = findPlan(state, planId);
  if (!plan) notFound();

  const tasks = tasksForPlan(state, planId);
  const archived = isArchivedPlan(state, planId);

  return (
    <ArchivedPlanDetailView
      plan={plan}
      projectId={projectId}
      tasks={tasks}
      isArchived={archived}
    />
  );
};

export default CockpitPlanPage;
