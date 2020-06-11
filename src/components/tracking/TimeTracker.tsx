import React, {
  FC, FormEvent, useState, useRef,
} from 'react';
import { css } from '@emotion/core';
import DatePicker from 'react-datepicker';

require('react-datepicker/dist/react-datepicker.css');


const datepicker = css`
  display: grid;
  grid-template:
    "overview form" auto
    / 3fr 1fr;
`;

const form = css`
  grid-area: form;
`;


export const TimeTracker: FC = () => {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const descriptionRef = useRef<HTMLTextAreaElement>();


  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log(e.target);
  };

  return (
    <div css={datepicker}>
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
