/* eslint-disable @typescript-eslint/no-misused-promises -- temp */
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

export interface TimeTrackerData {
  startTime: string;
  endTime: string;
  notes: string;
}

export interface TimeTrackerProps {
  startTime?: string;
  endTime?: string;
  notes?: string;
  onSubmit: SubmitHandler<TimeTrackerData>;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ onSubmit, startTime, endTime, notes }) => {
  const { handleSubmit, register } = useForm<TimeTrackerData>({
    defaultValues: {
      endTime,
      notes,
      startTime,
    }
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        TimeTracker
      <input {...register('startTime')} />
      <input {...register('endTime')} />
      <textarea {...register('notes')} />
      <button type="submit">Submit</button>
    </form>
  );
}
