/* eslint-disable @typescript-eslint/camelcase */
import React, { FC, FormEvent } from 'react';
import { useTrackMutation } from '../../../graphql/hooks';

type MutatorFunction = React.Dispatch<React.SetStateAction<Date>>

export const TimeTracker: FC = () => {
  const [mutate] = useTrackMutation();

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    mutate({
      variables: {
        input: {
          project_id: '123',
          start_time: new Date(),
          end_time: new Date(),
          description: 'test test',
        },
      },
    });
    console.log(e.target);
  };

  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>From:</legend>
        <input type="time" value="test" />
      </fieldset>

      <fieldset>
        <legend>QuickSelect</legend>
        <button type="submit">8h</button>
      </fieldset>

      <fieldset>
        <legend>To:</legend>
        <input type="date" value="1983-12-15" />
        <input type="time" value="21:31" />
      </fieldset>
      <button type="submit">Save</button>
    </form>
  );
};
