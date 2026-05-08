import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { TaskDetailView } from '@/components/cockpit/project';
import { findPlan, isArchivedTask } from '@/lib/cockpit/project-detail';
import { buildArchivedTaskRows } from '@/lib/cockpit/archive-detail';

interface CockpitTaskPageProps {
  params: Promise<{ projectId: string; taskId: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CockpitTaskPageProps): Promise<Metadata> {
  const { projectId, taskId } = await params;
  const repo = getCockpitRepository();
  const state = await repo.getProjectedProjectState(projectId);
  const task = state?.tasks?.[taskId];
  return {
    title: `Cockpit — ${task?.taskName ?? taskId}`,
  };
}

const CockpitTaskPage = async ({ params }: CockpitTaskPageProps) => {
  const { projectId, taskId } = await params;
  const repo = getCockpitRepository();
  const state = await repo.getProjectedProjectState(projectId);

  const task = state?.tasks?.[taskId];
  if (!task) {
    notFound();
  }
  const plan = findPlan(state, task.planId);
  const archived = isArchivedTask(state, task.taskId);

  // Look up the live counterpart so the archived view can offer a "compare
  // with live" jump. Computed via the same helper that drives the archive
  // index so the matching rule is consistent.
  let liveCounterpartTaskId: string | null = null;
  if (archived) {
    const archivedRows = buildArchivedTaskRows(state);
    const row = archivedRows.find((r) => r.task.taskId === task.taskId);
    liveCounterpartTaskId = row?.liveCounterpartTaskId ?? null;
  }

  return (
    <TaskDetailView
      task={task}
      plan={plan}
      projectId={projectId}
      isArchived={archived}
      liveCounterpartTaskId={liveCounterpartTaskId}
    />
  );
};

export default CockpitTaskPage;
