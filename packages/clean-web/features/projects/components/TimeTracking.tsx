import ReactDatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { setMilliseconds, setSeconds, setHours, setMinutes, format } from 'date-fns';
import de from 'date-fns/locale/de';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';

export interface TimeTrackingProps {
  projectId: string;
  className?: string;
  onSubmitTracking: (data: TrackingInput) => void;
  defaultValues?: TrackingInput;
}

registerLocale('de', de);
setDefaultLocale('de');


export const trackingInputSchema = z.object({
  projectId: z.string(),
  category: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  summary: z.string(),
});

export type TrackingInput = z.infer<typeof trackingInputSchema>;

const resetTime = (date: Date) => setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);

export const TimeTracking: React.FC<TimeTrackingProps> = ({ onSubmitTracking, projectId, defaultValues }) => {
  const { handleSubmit, register, control } = useForm<TrackingInput>({
    defaultValues: {
      ...defaultValues,
      projectId,
      category: 'dev',
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmitTracking)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-1 items-end gap-4">
          <div className="flex-1">
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <ReactDatePicker
                  {...field}
                  customInput={<TextField id="startTime" />}
                  dateFormat="dd.MM.yyyy HH:mm"
                  maxTime={resetTime(setHours(new Date(), 18))}
                  minTime={resetTime(setHours(new Date(), 8))}
                  placeholderText="Start Time"
                  selected={field.value}
                  showTimeSelect
                  value={format(field.value ?? new Date(), 'dd.MM.yyyy HH:mm')}
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
                  {...field}
                  customInput={<TextField id="endTime" />}
                  dateFormat="dd.MM.yyyy HH:mm"
                  maxTime={resetTime(setHours(new Date(), 16))}
                  minTime={resetTime(setHours(new Date(), 8))}
                  placeholderText="End Time"
                  selected={field.value}
                  showTimeSelect
                  value={format(field.value ?? new Date(), 'dd.MM.yyyy HH:mm')}
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
