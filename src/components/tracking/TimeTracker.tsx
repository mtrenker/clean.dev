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
      "labelFrom labelTo" max-content
      "datePickerFrom datePickerTo" max-content
      "description description" max-content
      "submitButton submitButton" max-content
      "popper popper" max-content
      / 1fr 1fr
    ;
    gap: 10px;
    position: absolute;

    .datePickerFrom {
      grid-area: datePickerFrom;
    }

    .datePickerTo {
      grid-area: datePickerTo;
    }
  `;

  const onSubmitProxy = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
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
      <button css={{ gridArea: 'submitButton' }} type="submit">Save</button>
    </form>
  );
};
