import ReactDatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { setMilliseconds, setSeconds, setHours, setMinutes, formatISO } from 'date-fns';
import de from 'date-fns/locale/de';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';
import clsx from 'clsx';

export interface TimeTrackingProps {
  projectId: string;
  className?: string;
  onSubmitTracking: (data: TrackingInput) => void;
  input?: TrackingInput;
}

registerLocale('de', de);
setDefaultLocale('de');


export const trackingInputSchema = z.object({
  projectId: z.string(),
  category: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  summary: z.string(),
});

export type TrackingInput = z.infer<typeof trackingInputSchema>;

const resetTime = (date: Date) => setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);

export const TimeTracking: React.FC<TimeTrackingProps> = ({ onSubmitTracking, projectId }) => {
  const { handleSubmit, register, control, setValue } = useForm<TrackingInput>();
  return (
    <form onSubmit={handleSubmit(onSubmitTracking)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-1 items-end gap-4">
          <div className="flex-1">
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => {
                return (
                  <ReactDatePicker
                    customInput={<TextField id="startTime" />}
                    dateFormat="dd.MM.yyyy HH:mm"
                    maxTime={resetTime(setHours(new Date(), 18))}
                    minTime={resetTime(setHours(new Date(), 8))}
                    onChange={(date: Date) => setValue('startTime', formatISO(date))}
                    placeholderText="Start Time"
                    selected={field.value ? new Date(field.value) : new Date()}
                    showTimeSelect
                  />
                );
              }}
            />
          </div>
          <div className="flex-1">
            <select
              className={clsx([
                'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                'dark:bg-zinc-50 dark:text-black',
              ])}
              {...register('category')}
            >
              <option value="dev">Development</option>
            </select>
          </div>
          <div className="flex-1">
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <ReactDatePicker
                  customInput={<TextField id="endTime" />}
                  dateFormat="dd.MM.yyyy HH:mm"
                  maxTime={resetTime(setHours(new Date(), 18))}
                  minTime={resetTime(setHours(new Date(), 8))}
                  onChange={(date: Date) => setValue('endTime', formatISO(date))}
                  placeholderText="Start Time"
                  selected={field.value ? new Date(field.value) : new Date()}
                  showTimeSelect
                />
              )}
            />
          </div>
        </div>
        <TextArea label="Summary" {...register('summary')} />
        <input type="hidden" {...register('projectId')} value={projectId} />
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};
