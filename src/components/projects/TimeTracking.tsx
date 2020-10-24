import React, { FC } from 'react';
import { css } from '@emotion/core';
import { format } from 'date-fns';

import { useParams } from 'react-router-dom';
import { TimeTracker, TrackingForm } from './TimeTracker';
import {
  GetTrackingsDocument,
  GetTrackingsQuery,
  GetTrackingsQueryVariables,
  useCreateTrackingMutation,
  useDeleteTrackingMutation,
  useGetTrackingsQuery,
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
  const { projectId } = useParams<{projectId: string}>();

  const { data: trackingData } = useGetTrackingsQuery({
    variables: { projectId },
  });
  const [createTracking] = useCreateTrackingMutation();
  const [deleteTracking] = useDeleteTrackingMutation();

  const trackings = trackingData?.getTrackings.items;

  const onSubmit = (trackingForm: TrackingForm) => {
    createTracking({
      variables: {
        input: {
          projectId,
          ...trackingForm,
        },
      },
      update: (proxy, { data: getTrackingsData }) => {
        if (projectId && getTrackingsData?.createTracking.success) {
          const cache = proxy.readQuery<GetTrackingsQuery, GetTrackingsQueryVariables>({
            query: GetTrackingsDocument,
            variables: { projectId },
          });
          const newTrackingItem = getTrackingsData?.createTracking.tracking;
          if (projectId && cache && newTrackingItem) {
            proxy.writeQuery<GetTrackingsQuery, GetTrackingsQueryVariables>({
              query: GetTrackingsDocument,
              variables: { projectId },
              data: {
                ...cache,
                getTrackings: {
                  ...cache.getTrackings,
                  items: [...cache.getTrackings.items, newTrackingItem],
                },
              },
            });
          }
        }
      },
    });
  };

  const onDeleteTracking = (id: string) => {
    deleteTracking({
      variables: {
        id,
      },
      update: (proxy, { data: deleteTrackingData }) => {
        if (projectId && deleteTrackingData?.deleteTracking.success) {
          const cache = proxy.readQuery<GetTrackingsQuery, GetTrackingsQueryVariables>({
            query: GetTrackingsDocument,
            variables: { projectId },
          });
          if (cache) {
            const updatedItems = cache.getTrackings.items.filter((tracking) => tracking.id !== id);
            proxy.writeQuery<GetTrackingsQuery>({
              query: GetTrackingsDocument,
              variables: { projectId },
              data: {
                ...cache,
                getTrackings: {
                  ...cache.getTrackings,
                  items: updatedItems,
                },
              },
            });
          }
        }
      },
    });
  };

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
                  <button type="button" onClick={() => onDeleteTracking(tracking.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot />
        </table>
      </div>
      <TimeTracker
        onChangeProject={(id) => console.log(id)}
        onSubmit={onSubmit}
      />
    </div>
  );
};
