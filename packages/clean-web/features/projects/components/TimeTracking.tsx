import ReactDatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { formatISO } from 'date-fns';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';

export interface TimeTrackingProps {
  projectId: string;
  className?: string;
  onSubmit: (data: TrackingInput) => void;
}

export const trackingInputSchema = z.object({
  projectId: z.string(),
  category: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  summary: z.string().optional(),
});

export type TrackingInput = z.infer<typeof trackingInputSchema>;


export const TimeTracking: React.FC<TimeTrackingProps> = ({ onSubmit, projectId }) => {
  const { handleSubmit, register, control, setValue } = useForm<TrackingInput>({
    defaultValues: {
      projectId,
      category: 'dev',
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-1 items-end gap-4">
          <div className="flex-1">
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <ReactDatePicker
                  customInput={<TextField id="startTime" label="Start Time" />}
                  showTimeSelect
                  {...field}
                  onChange={(date: Date) => setValue('startTime', formatISO(date))}
                />
              )}
            />
          </div>
          <div className="flex-1">
            <select className="w-full text-black" {...register('category')}>
              <option value="dev">Development</option>
            </select>
          </div>
          <div className="flex-1">
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <ReactDatePicker
                  customInput={<TextField id="endTime" label="End Time" />}
                  showTimeSelect
                  {...field}
                  onChange={(date: Date) => setValue('endTime', formatISO(date))}
                />
              )}
            />
          </div>
        </div>
        <TextArea label="Summary" {...register('summary')} />
        <input type="hidden" {...register('projectId')} />
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};
