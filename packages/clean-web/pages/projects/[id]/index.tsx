import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import 'react-datepicker/dist/react-datepicker.css';
import { TimeTracking, TrackingInput } from '../../../features/projects/components/TimeTracking';
import { Tracking, useCreateTrackingMutation, useGetProjectsWithTrackingsQuery, useRemoveTrackingMutation } from '../../../graphql/generated';
import { TimeSheet } from '../../../features/projects/components/TimeSheet';

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsWithTrackingsQuery();
  const project = data?.projects.find(project => project.id === id);

  const [page, setPage] = useState<'overview' | 'tracking'>('tracking');

  const [createTracking] = useCreateTrackingMutation();
  const [removeTracking] = useRemoveTrackingMutation();

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
        </ul>
      </div>

      <div>
        {page === 'overview' && (
          <>
            {project?.client}
          </>
        )}
        {page === 'tracking' && (
          <>
            <TimeTracking onSubmit={onTrackingSubmit} projectId={id as string} />
            <hr />
            <TimeSheet onRemoveTracking={onRemoveTracking} project={project} />
          </>
        )}
      </div>
    </main>
  );
};

export default ProjectDetailPage;
