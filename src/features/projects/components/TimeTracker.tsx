/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Box } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import {
  setHours, setMinutes, addDays, differenceInHours, setSeconds, setMilliseconds,
} from 'date-fns';
import { TextField } from '../../../common/components/TextField';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../../../common/components/Button';
import { useCreateTrackingMutation } from '../../../app/api/generated';

export interface TimeTrackerData {
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface TimeTrackerProps {
  projectId: string;
}

const resetTime = (date: Date) => setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);

export const TimeTracker: React.VFC<TimeTrackerProps> = ({ projectId }) => {
  const {
    control, setValue, watch, handleSubmit, register,
  } = useForm<TimeTrackerData>();

  const [track] = useCreateTrackingMutation();

  const trackTime = (data: TimeTrackerData) => {
    track({
      input: {
        projectId,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        description: data.description,
      },
    });
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
    <Box
      component="form"
      onSubmit={handleSubmit(trackTime)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 1,
      }}
    >
      <Box>
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <DatePicker
              customInput={<TextField fullWidth label="Start date" />}
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
      </Box>

      <Box>
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <DatePicker
              customInput={<TextField fullWidth label="End date" />}
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
      </Box>

      <Box
        sx={{
          gridColumn: '1 / 3',
        }}
      >
        <TextField
          fullWidth
          multiline
          label="Description"
          placeholder="Description"
          rows={2}
          {...register('description')}
        />
      </Box>

      <Box
        sx={{
          gridColumn: '1 / 3',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button fullWidth type="submit">Track</Button>
      </Box>
    </Box>
  );
};
