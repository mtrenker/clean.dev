import { NextPage } from 'next';
import { useRouter } from 'next/router';

import 'react-datepicker/dist/react-datepicker.css';
import { TimeTracking, TrackingInput } from '../../../features/projects/components/TimeTracking';
import { Tracking, useCreateTrackingMutation, useGetProjectWithTrackingsQuery, useRemoveTrackingMutation, useUpdateProjectMutation } from '../../../graphql/generated';
import { TrackingTable } from '../../../features/projects/components/TrackingTable';
import Link from 'next/link';
import { ProjectForm, ProjectFormData } from '../../../features/projects/components/ProjectForm';
import { TrackingGraph } from '../../../features/projects/components/TrackingGraph';

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectWithTrackingsQuery({
    variables: {
      id: id as string,
      date: '2023-02',
    },
  });

  const project = data?.project;

  const [createTracking] = useCreateTrackingMutation();
  const [removeTracking] = useRemoveTrackingMutation();

  const [updateProject] = useUpdateProjectMutation();

  const onProjectUpdate = async (project: ProjectFormData) => {
    await updateProject({
      variables: {
        id: id as string,
        input: project,
      },
    });
  };

  const onRemoveTracking = ({ __typename, ...input }: Tracking) => {
    removeTracking({
      variables: {
        input: {
          projectId: id as string,
          ...input,
        },
      },
    });
  };

  const onTrackingSubmit = (input: TrackingInput) => {
    createTracking({
      variables: {
        input,
      },
    });
  };

  if (!id) return null;

  return (
    <main className="container mx-4 sm:mx-auto">
      <div className="flex flex-wrap gap-4 sm:flex-nowrap">
        <div className="flex-1">
          <h2>{project?.client}</h2>
          <ul>
            <li><Link href={`/projects/${id}/timesheet`}>Timesheet</Link></li>
            <li><Link href={`/projects/${id}/invoice`}>Invoice</Link></li>
          </ul>
          <TrackingGraph project={project} />
        </div>
        <div className="flex-1">
          <TimeTracking
            onSubmitTracking={onTrackingSubmit}
            projectId={id as string}
          />
          <TrackingTable
            onRemoveTracking={onRemoveTracking}
            project={project}
          />
        </div>
      </div>

      <div>
        {project && (
          <ProjectForm onSubmit={onProjectUpdate} project={project} />
        )}
      </div>
    </main>
  );
};

export default ProjectDetailPage;
