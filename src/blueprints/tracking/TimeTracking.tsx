import React, { FC, MouseEvent, useState } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { TimeTracker } from '../../components/tracking/TimeTracker';
import {
  useGetTrackingOverviewQuery,
  useTrackMutation,
  GetTrackingOverviewQueryVariables,
  GetTrackingOverviewDocument,
  GetTrackingOverviewQuery,
  Tracking,
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
  const queryVariables: GetTrackingOverviewQueryVariables = {
    query: {
      date: '2020',
      project: '123', // consistent fake id until project data handling is implemented
    },
  };
  const { data, error } = useGetTrackingOverviewQuery({ variables: queryVariables });
  const [mutate, result] = useTrackMutation();

  const onCancelEdit = () => {
    setTrackingToEdit(undefined);
  };

  const onEditClick = (tracking: Tracking) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTrackingToEdit(tracking);
  };

  const onSubmit = (e: MouseEvent<HTMLFormElement>, startTime: string, endTime: string, description: string) => {
    const variables = {
      input: {
        projectId: '123',
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
              variables: queryVariables,
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
            {data && data.trackings?.items?.map((tracking) => (
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
      <TimeTracker onCancelEdit={onCancelEdit} onSubmit={onSubmit} tracking={trackingToEdit} />
    </div>
  );
};
