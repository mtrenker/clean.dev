/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import DatePicker, { registerLocale } from 'react-datepicker';
import {
  setHours, setMinutes, addDays, setSeconds, setMilliseconds,
} from 'date-fns';
import de from 'date-fns/locale/de';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { TextField } from '../../../common/components/TextField';
import { Button } from '../../../common/components/Button';
import { useCreateTrackingMutation } from '../../../app/api/generated';

import 'react-datepicker/dist/react-datepicker.css';

export interface TimeTrackerData {
  startTime: Date;
  endTime: Date;
  description: string;
}

export interface TimeTrackerProps {
  date: string;
  projectId: string;
}

registerLocale('de', de);

const resetTime = (date: Date) => setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);

export const TimeTracker: React.FC<TimeTrackerProps> = ({ projectId, date }) => {
  const {
    control, setValue, watch, handleSubmit, register,
  } = useForm<TimeTrackerData>({
    defaultValues: {
      startTime: setHours(new Date(date), 8),
      endTime: setHours(new Date(date), 16),
    },
  });

  const [track] = useCreateTrackingMutation();

  const trackTime = async (data: TimeTrackerData) => {
    await track({
      input: {
        projectId,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        description: data.description,
      },
    }).unwrap();
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton size="small" onClick={() => prevDay()}>
          <ArrowBack />
        </IconButton>
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <DatePicker
              customInput={(
                <TextField
                  size="small"
                  fullWidth
                  label="Start date"
                />
              )}
              showTimeSelect
              placeholderText="Start date"
              onChange={field.onChange}
              selected={field.value}
              dateFormat="dd.MM.yyyy HH:mm"
              minTime={resetTime(setHours(new Date(), 8))}
              maxTime={resetTime(setHours(new Date(), 16))}
              locale="de"
            />
          )}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <DatePicker
              customInput={(
                <TextField
                  size="small"
                  fullWidth
                  label="End date"
                />
              )}
              showTimeSelect
              placeholderText="End date"
              onChange={field.onChange}
              selected={field.value}
              dateFormat="dd.MM.yyyy HH:mm"
              minTime={resetTime(setHours(new Date(), 8))}
              maxTime={resetTime(setHours(new Date(), 16))}
              locale="de"
            />
          )}
        />
        <IconButton size="small" onClick={() => nextDay()}>
          <ArrowForward />
        </IconButton>
      </Box>

      <Box
        sx={{
          gridColumn: '1 / 3',
        }}
      >
        <TextField
          fullWidth
          multiline
          size="small"
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
