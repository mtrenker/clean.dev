/* eslint-disable react/button-has-type */
import { css } from '@emotion/react';
import { setHours, setMinutes, addDays } from 'date-fns';
import { VFC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useCreateTrackingMutation } from '../../graphql/hooks';
import { Timesheet } from './Timesheet';

interface TrackingData {
  description: string;
  startTime: Date;
  endTime: Date;
}

const trackingCss = css`
  .tracker {
    max-width: 400px;
    margin: 0 auto;
    display: grid;
    grid-template:
      "startTime endTime" auto
      "tools tools" auto
      "description description" auto
      "reset submit" auto
      / 1fr 1fr
    ;
    label input, label textarea, > button {
      width: 100%;
    }
    .startTime {
      grid-area: startTime;
    }
    .endTime {
      grid-area: endTime;
    }
    .tools {
      grid-area: tools;
      display: flex;
      background: white;
      padding: 8px;
    }
    .description {
      grid-area: description;
    }

    .react-datepicker__time-list-item--disabled {
      display: none;
    }
  }
`;

export const Tracking: VFC = () => {
  const {
    handleSubmit, control, register, watch, setValue,
  } = useForm<TrackingData>();
  const [createTracking] = useCreateTrackingMutation();
  const { projectId } = useParams<{projectId: string}>();
  const onSubmit = (data: TrackingData) => {
    createTracking({
      variables: {
        input: {
          ...data,
          startTime: data.startTime.toISOString(),
          endTime: data.endTime.toISOString(),
          projectId,
        },
      },
    });
    nextDay();
  };

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const nextDay = () => {
    setValue('startTime', addDays(startTime, 1));
    setValue('endTime', addDays(endTime, 1));
  };

  return (
    <div css={trackingCss}>
      <form className="tracker" onSubmit={handleSubmit(onSubmit)}>

        <label htmlFor="startTime" className="startTime">
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <DatePicker
                showTimeSelect
                placeholderText="Start date"
                onChange={field.onChange}
                selected={field.value}
                dateFormat="dd.MM.yyyy HH:mm"
                minTime={setHours(setMinutes(new Date(), 0), 8)}
                maxTime={setHours(setMinutes(new Date(), 0), 18)}
              />
            )}
          />
        </label>

        <label htmlFor="endTime" className="endTime">
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <DatePicker
                showTimeSelect
                placeholderText="End date"
                onChange={field.onChange}
                selected={field.value}
                dateFormat="dd.MM.yyyy HH:mm"
                minTime={setHours(setMinutes(new Date(), 0), 8)}
                maxTime={setHours(setMinutes(new Date(), 0), 18)}
              />
            )}
          />
        </label>

        <div className="tools">
          <button type="button" onClick={nextDay}>Next Day</button>
        </div>

        <label htmlFor="description" className="description">
          <textarea id="description" rows={5} {...register('description')} />
        </label>
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
      </form>
      <Timesheet date="2021-10" />
    </div>
  );
};
