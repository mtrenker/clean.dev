import React, { FC } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { TimeTracker, TrackingForm } from '../projects/TimeTracker';
import {
  useCreateTrackingMutation,
  useGetProjectsQuery,
  useGetTrackingsLazyQuery,
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
  const [getTrackings, { data: trackingData }] = useGetTrackingsLazyQuery();

  const trackings = trackingData?.getTrackings.edges;

  const { data } = useGetProjectsQuery({
    onCompleted: (projectData) => {
      getTrackings({
        variables: {
          query: { projectId: projectData.getProjects.edges[0].id },
        },
      });
    },
  });

  const [createTracking] = useCreateTrackingMutation();

  const onSubmit = (trackingForm: TrackingForm) => {
    createTracking({
      variables: {
        input: {
          ...trackingForm,
        },
      },
    });
  };

  const projects = data?.getProjects.edges.map((project) => ({
    id: project.id,
    client: project.client,
  }));

  return (
    <div css={timeTrackingCss}>
      <div>
        <DatePicker
          onChange={() => { console.log('k'); }}
          selected={new Date()}
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
            {trackings?.map((tracking) => (
              <tr key={tracking.id}>
                <td css={{ whiteSpace: 'pre' }}>{tracking.description}</td>
                <td>{format(new Date(tracking.startTime), 'dd.MM.yyyy HH:mm')}</td>
                <td>{format(new Date(tracking.endTime), 'dd.MM.yyyy HH:mm')}</td>
                <td>
                  <button type="button">
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
        projects={projects ?? []}
        onChangeProject={(id) => console.log(id)}
        onSubmit={onSubmit}
      />
    </div>
  );
};
