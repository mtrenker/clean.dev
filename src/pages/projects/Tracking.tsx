import { VFC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useCreateTrackingMutation } from '../../graphql/hooks';

interface TrackingData {
  description: string;
  startTime: Date;
  endTime: Date;
}

export const Tracking: VFC = () => {
  const { handleSubmit, control, register } = useForm<TrackingData>();
  const [createTracking] = useCreateTrackingMutation();
  const { projectId } = useParams<{projectId: string}>();
  const onSubmit = (data: TrackingData) => {
    createTracking({
      variables: {
        input: {
          ...data,
          startTime: data.startTime.toISOString(),
          endTime: data.startTime.toISOString(),
          projectId,
        },
      },
    });
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <DatePicker
              showTimeSelect
              placeholderText="Start date"
              onChange={field.onChange}
              selected={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <DatePicker
              showTimeSelect
              placeholderText="End date"
              onChange={field.onChange}
              selected={field.value}
            />
          )}
        />

        <textarea id="description" rows={5} {...register('description')} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
