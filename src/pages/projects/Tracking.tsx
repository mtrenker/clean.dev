/* eslint-disable react/button-has-type */
import { css } from '@emotion/react';
import {
  setHours, setMinutes, addDays, differenceInHours, setSeconds, setMilliseconds,
} from 'date-fns';
import { VFC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useCreateTrackingMutation, useUpdateTrackingMutation } from '../../graphql/hooks';
import { Timesheet } from './Timesheet';

interface TrackingData {
  description: string;
  startTime: Date;
  endTime: Date;
}

const resetTime = (date: Date) => setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);

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
  const [updateTracking] = useUpdateTrackingMutation();
  const { projectId, trackingId } = useParams<{projectId: string, trackingId: string}>();
  const onSubmit = (data: TrackingData) => {
    if (trackingId) {
      updateTracking({
        variables: {
          id: trackingId,
          input: {
            ...data,
            startTime: data.startTime.toISOString(),
            endTime: data.endTime.toISOString(),
            projectId,
          },
        },
      });
    } else {
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
    }
    nextDay();
  };

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const prevDay = () => {
    setValue('startTime', addDays(startTime, -1));
    setValue('endTime', addDays(endTime, -1));
  };
  const nextDay = () => {
    setValue('startTime', addDays(startTime, 1));
    setValue('endTime', addDays(endTime, 1));
  };

  const today = () => {
    setValue('startTime', resetTime(setHours(new Date(), 8)));
    setValue('endTime', resetTime(setHours(new Date(), 16)));
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
                minTime={resetTime(setHours(new Date(), 8))}
                maxTime={resetTime(setHours(new Date(), 16))}
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
                minTime={resetTime(setHours(new Date(), 8))}
                maxTime={resetTime(setHours(new Date(), 16))}
              />
            )}
          />
        </label>

        <div className="tools">
          <button type="button" onClick={prevDay}>Prev Day</button>
          <button type="button" onClick={today}>Today (8-16)</button>
          <button type="button" onClick={nextDay}>Next Day</button>
          <span>{differenceInHours(endTime, startTime)}</span>
        </div>

        <label htmlFor="description" className="description">
          <textarea id="description" rows={5} {...register('description')} />
        </label>
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
      </form>
      <Timesheet date="2021-12" />
    </div>
  );
};
