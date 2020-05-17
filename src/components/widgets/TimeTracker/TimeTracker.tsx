/* eslint-disable @typescript-eslint/camelcase */
import React, { FC, FormEvent, useState } from 'react';
import { css } from '@emotion/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


import { useTrackMutation } from '../../../graphql/hooks';


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
  const [mutate] = useTrackMutation();

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    mutate({
      variables: {
        input: {
          project_id: '123',
          start_time: startTime,
          end_time: endTime,
          description: 'test test',
        },
      },
    });
    console.log(e.target);
  };

  return (
    <div css={datepicker}>
      <div css={overview}>
        <p>{startTime.toString()}</p>
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
        <button type="submit">Save</button>
      </form>
    </div>
  );
};
