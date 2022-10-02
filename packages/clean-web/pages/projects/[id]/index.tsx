import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import 'react-datepicker/dist/react-datepicker.css';
import { TimeTracking, TrackingInput } from '../../../features/projects/components/TimeTracking';
import { Tracking, useCreateTrackingMutation, useGetProjectsWithTrackingsQuery, useRemoveTrackingMutation, useUpdateProjectMutation } from '../../../graphql/generated';
import { TrackingTable } from '../../../features/projects/components/TrackingTable';
import Link from 'next/link';
import { ProjectForm, ProjectFormData } from '../../../features/projects/components/ProjectForm';

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsWithTrackingsQuery();
  const project = data?.projects.find(project => project.id === id);

  const [page, setPage] = useState<'overview' | 'edit' | 'tracking'>('overview');

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
          ...input,
          projectId: id as string,
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
    <main className="container mx-auto">
      <div className="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <ul className="-mb-px flex flex-wrap">
          <li className="mr-2">
            <a
              className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              href="#"
              onClick={() => setPage('overview')}
            >
              Overview
            </a>
          </li>
          <li className="mr-2">
            <a
              className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              href="#"
              onClick={() => setPage('tracking')}
            >
              Tracking
            </a>
          </li>
          <li className="mr-2">
            <a
              className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              href="#"
              onClick={() => setPage('edit')}
            >
              Edit
            </a>
          </li>
        </ul>
      </div>

      <div>
        {page === 'overview' && (
          <>
            <h2>{project?.client}</h2>
            <ul>
              <li><Link href={`/projects/${id}/timesheet`}>Timesheet</Link></li>
              <li><Link href={`/projects/${id}/invoice`}>Invoice</Link></li>
            </ul>
          </>
        )}
        {page === 'edit' && (
          <ProjectForm onSubmit={onProjectUpdate} project={project} />
        )}
        {page === 'tracking' && (
          <>
            <TimeTracking
              onSubmitTracking={onTrackingSubmit}
              projectId={id as string}
            />
            <hr />
            <TrackingTable
              onRemoveTracking={onRemoveTracking}
              project={project}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default ProjectDetailPage;
