import React, { FC, MouseEvent, useState } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { TimeTracker, TimeTrackerProjects } from '../TimeTracker';
import {
  useTrackMutation,
  Tracking,
  useGetProjectsQuery,
  useGetTrackingOverviewLazyQuery,
} from '../../graphql/hooks';

const timeTrackingCss = css`
  display: grid;
  grid-template:
    "trackings tracker" max-content
    / 3fr 1fr
  ;
  gap: 32px;

  table {
    width: 100%;
    tbody > tr:nth-of-type(even) {
      background: #ccc;
    }
    tbody tr.active {
      background-color: hotpink;
    }
  }
`;

export const TimeTracking: FC = () => {
  const [trackingToEdit, setTrackingToEdit] = useState<Tracking | undefined>(undefined);

  const [trackingQuery, { data: trackingData, refetch: refetchTrackings }] = useGetTrackingOverviewLazyQuery();
  const trackings = trackingData?.trackings.items ?? [];

  const getTrackings = (project: string): void => {
    trackingQuery({
      variables: {
        query: {
          date: '2020',
          project,
        },
      },
    });
  };

  const { data: projectData } = useGetProjectsQuery({
    onCompleted: (data) => {
      getTrackings(data.projects.items[0].id);
    },
  });
  const projects = projectData?.projects.items.reduce((prev, cur) => {
    prev.push({
      id: cur.id,
      client: cur.client,
    });
    return prev;
  }, [] as TimeTrackerProjects[]) ?? [];

  const [mutate] = useTrackMutation();

  const onCancelEdit = () => {
    setTrackingToEdit(undefined);
  };

  const onEditClick = (tracking: Tracking) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTrackingToEdit(tracking);
  };

  const onSubmit = (
    e: MouseEvent<HTMLFormElement>,
    projectId: string,
    startTime: string,
    endTime: string,
    description: string,
  ) => {
    const variables = {
      input: {
        projectId,
        startTime,
        endTime,
        description,
      },
    };
    mutate({
      variables,
      update: () => {
        refetchTrackings();
      },
    });
    onCancelEdit();
  };
  return (
    <div css={timeTrackingCss}>
      <div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trackings.map((tracking) => (
              <tr key={tracking.id} className={tracking.id === trackingToEdit?.id ? 'active' : ''}>
                <td css={{ whiteSpace: 'pre' }}>{tracking.description}</td>
                <td>{format(new Date(tracking.startTime), 'dd.MM.yyyy HH:mm')}</td>
                <td>{format(new Date(tracking.endTime), 'dd.MM.yyyy HH:mm')}</td>
                <td>
                  <button type="button" onClick={onEditClick(tracking)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot />
        </table>
      </div>
      <TimeTracker
        projects={projects}
        onChangeProject={getTrackings}
        onCancelEdit={onCancelEdit}
        onSubmit={onSubmit}
        tracking={trackingToEdit}
      />
    </div>
  );
};
