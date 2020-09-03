import React, { FC, MouseEvent, useState } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { TimeTracker, TimeTrackerProjects } from '../projects/TimeTracker';
import {
  useTrackMutation,
  Tracking,
  useGetProjectsQuery,
  useGetTrackingOverviewLazyQuery,
} from '../../graphql/hooks';
import { DatePicker } from '../controls/DatePicker';

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
  const [date, setDate] = useState<Date>(new Date());

  const [trackingQuery, { data: trackingData, refetch: refetchTrackings }] = useGetTrackingOverviewLazyQuery();
  const trackings = trackingData?.trackings.items ?? [];

  const getTrackings = (project: string): void => {
    trackingQuery({
      variables: {
        trackingQuery: {
          date: format(date, 'u-MM'),
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
    mutate({
      variables: {
        trackingInput: {
          projectId,
          startTime,
          endTime,
          description,
        },
      },
      update: () => {
        refetchTrackings?.();
      },
    });
    onCancelEdit();
  };
  return (
    <div css={timeTrackingCss}>
      <div>
        <DatePicker
          onChange={(newDate: Date) => {
            setDate(newDate);
            refetchTrackings?.({
              trackingQuery: {
                date: format(newDate, 'u-MM'),
                project: projectData?.projects.items[0].id,
              },
            });
          }}
          selected={date}
        />
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
