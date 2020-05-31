import React, {
  FC, FormEvent, useState, useRef,
} from 'react';
import { css } from '@emotion/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


import { useTrackMutation, useGetTrackingsQuery } from '../../../graphql/hooks';


const datepicker = css`
  display: grid;
  grid-template:
    "overview form" auto
    / 3fr 1fr;
`;

const overview = css`
  grid-area: overview;
`;

const form = css`
  grid-area: form;
`;


export const TimeTracker: FC = () => {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const descriptionRef = useRef<HTMLTextAreaElement>();
  const [mutate] = useTrackMutation();

  const { data } = useGetTrackingsQuery({
    variables: {
      query: {
        date: '2020-05',
        project: '123',
      },
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    mutate({
      variables: {
        input: {
          projectId: '123',
          startTime,
          endTime,
          description: descriptionRef.current.value,
        },
      },
    });
    console.log(e.target);
  };

  return (
    <div css={datepicker}>
      <div css={overview}>
        {data?.trackings?.map((tracking) => (
          <div>
            {tracking.startTime}
            <br />
            {tracking.endTime}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} css={form}>
        <DatePicker
          selected={startTime}
          showTimeSelect
          onChange={setStartTime}
          dateFormat="MMMM d, yyyy h:mm aa"
          showWeekNumbers
        />
        <DatePicker
          selected={endTime}
          showTimeSelect
          onChange={setEndTime}
          dateFormat="MMMM d, yyyy h:mm aa"
          showWeekNumbers
        />
        <textarea ref={descriptionRef} />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};
