import React, {
  FC, useState, useRef, MouseEvent,
} from 'react';
import { css } from '@emotion/core';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

interface TimeTrackerProps {
  onSubmit: (e: MouseEvent<HTMLFormElement>) => void;
}

export const TimeTracker: FC<TimeTrackerProps> = ({ onSubmit }) => {
  const [startTime, setStartTime] = useState<Date|null>(new Date());
  const [endTime, setEndTime] = useState<Date|null>(new Date());
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const formCss = css`
    display: grid;
    grid-template:
      "labelFrom labelTo quickSelect" max-content
      "datePickerFrom datePickerTo quickSelect" max-content
      "description description quickSelect" max-content
      "submitButton submitButton quickSelect" max-content
      "popper popper quickSelect" max-content
      / 1fr 1fr 1fr
    ;
    gap: 10px;
    position: absolute;

    .datePickerFrom {
      grid-area: datePickerFrom;
    }

    .datePickerTo {
      grid-area: datePickerTo;
    }

    .quickSelect {
      grid-area: quickSelect;

      button {
        display: block;
      }
    }
  `;

  const onSubmitProxy = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  const quickSelect = (e: MouseEvent<HTMLButtonElement>) => {
    switch (e.currentTarget.value) {
      case 'today-8-16': {
        const quickStartTime = new Date();
        quickStartTime.setHours(8);
        quickStartTime.setMinutes(0);
        quickStartTime.setSeconds(0);
        setStartTime(quickStartTime);

        const quickEndTime = new Date(quickStartTime);
        quickEndTime.setHours(16);
        setEndTime(quickEndTime);
        break;
      }
      default:
        break;
    }
  };

  const dateFormat = 'MMMM d, yyyy h:mm aa';

  return (
    <form onSubmit={onSubmitProxy} css={formCss}>
      <label css={{ gridArea: 'labelFrom' }} htmlFor="from">From:</label>
      <div className="datePickerFrom">
        <DatePicker
          id="from"
          selected={startTime}
          showTimeSelect
          onChange={setStartTime}
          dateFormat={dateFormat}
          showWeekNumbers
        />
      </div>
      <label css={{ gridArea: 'labelTo' }} htmlFor="to">To:</label>
      <div className="datePickerTo">
        <DatePicker
          selected={endTime}
          showTimeSelect
          onChange={setEndTime}
          dateFormat={dateFormat}
          showWeekNumbers
        />
      </div>
      <textarea css={{ gridArea: 'description' }} ref={descriptionRef} />
      <div className="quickSelect">
        <fieldset>
          <legend>Quickselect</legend>
          <button value="today-8-16" type="button" onClick={quickSelect}>Today 8-16</button>
        </fieldset>
      </div>
      <button css={{ gridArea: 'submitButton' }} type="submit">Save</button>
    </form>
  );
};
