import React, { FC, MouseEvent, useState } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { TimeTracker, TimeTrackerProjects } from '../../components/tracking/TimeTracker';
import {
  useGetTrackingOverviewQuery,
  useTrackMutation,
  GetTrackingOverviewDocument,
  GetTrackingOverviewQuery,
  Tracking,
  useGetProjectsQuery,
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
  const { data: projectData } = useGetProjectsQuery();
  const projects = projectData?.projects.items.reduce((prev, cur) => {
    prev.push({
      id: cur.id,
      client: cur.client,
    });
    return prev;
  }, [] as TimeTrackerProjects[]) ?? [];
  const { data: trackingData, error } = useGetTrackingOverviewQuery({
    variables: {
      query: {
        date: '2020',
        project: projectData?.projects.items[0].id ?? '',
      },
    },
  });
  const [mutate, result] = useTrackMutation();

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
      optimisticResponse: {
        __typename: 'Mutation',
        track: {
          __typename: 'Tracking',
          id: 'fake-id',
          startTime,
          endTime,
          description: 'Pending...',
        },
      },
      update: (proxy, mutationResult) => {
        const track = mutationResult.data?.track;
        if (track) {
          try {
            const queryResult = proxy.readQuery<GetTrackingOverviewQuery>({
              query: GetTrackingOverviewDocument,
              variables,
            });
            if (queryResult) {
              const existingIndex = queryResult.trackings.items.findIndex((tracking) => tracking.id === track.id);
              if (existingIndex === -1) {
                queryResult.trackings.items.push(track);
              } else {
                queryResult.trackings.items[existingIndex] = track;
              }
              proxy.writeQuery<GetTrackingOverviewQuery>({
                query: GetTrackingOverviewDocument,
                data: queryResult,
              });
            }
          } catch (updateError) {
            console.error(updateError);
          }
        }
      },
    });
  };
  if (error || result.error) {
    return <p>Error</p>;
  }
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
            {trackingData && trackingData.trackings?.items?.map((tracking) => (
              <tr key={tracking.id} className={tracking.id === trackingToEdit?.id ? 'active' : ''}>
                <td>{tracking.description}</td>
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
      <TimeTracker projects={projects} onCancelEdit={onCancelEdit} onSubmit={onSubmit} tracking={trackingToEdit} />
    </div>
  );
};
