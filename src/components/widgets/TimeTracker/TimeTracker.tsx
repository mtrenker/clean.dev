/* eslint-disable @typescript-eslint/camelcase */
import React, {
  FC, useState, ChangeEvent,
} from 'react';
import { useTrackMutation } from '../../../graphql/hooks';

type MutatorFunction = React.Dispatch<React.SetStateAction<Date>>

export const TimeTracker: FC = () => {
  const [mutate] = useTrackMutation();

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(new Date());
  const [endtTime, setEndtTime] = useState('16:00');

  const onClick = (): void => {
    mutate({
      variables: {
        input: {
          project_id: 'project-123',
          start_time: startTime,
          end_time: endtTime,
        },
      },
    });
  };
  const onChange = (mutator: MutatorFunction) => (e: ChangeEvent<HTMLInputElement>): void => {
    mutator(new Date(e.target.value));
  };
  return (
    <div>
      <fieldset>
        <legend>From:</legend>
        <input type="date" onChange={onChange(setStartDate)} value={startDate.toString()} />
        <input type="time" onChange={onChange(setStartTime)} value={startTime} />
      </fieldset>

      <fieldset>
        <legend>QuickSelect</legend>
        <button>8h</button>
      </fieldset>

      <fieldset>
        <legend>To:</legend>
        <input type="date" value="1983-12-15" />
        <input type="time" value="21:31" />
      </fieldset>
      <button onClick={onClick}>Save</button>
    </div>
  );
};
