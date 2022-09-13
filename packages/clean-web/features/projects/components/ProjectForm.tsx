import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';

export interface ProjectData {
  client: string;
  location?: string;
  position: string;
  summary: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
  featured?: boolean;
}

export interface ProjectFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: ProjectData;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, defaultValues }) => {
  const { setValue, handleSubmit, register, control } = useForm<ProjectData>({
    defaultValues,
  });
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-4 rounded border bg-zinc-800 p-4">
        <TextField id="client" label="client" {...register('client')} />
        <TextField id="location" label="location" {...register('location')} />
        <TextField id="position" label="position" {...register('position')} />
        <TextArea id="summary" label="summary" {...register('summary')} />
        <div className="flex gap-2">
          <div className="flex-1">
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  customInput={<TextField id="startDate" label="startDate" />}
                  {...field}
                  onChange={(date: Date) => setValue('startDate', format(date, 'yyyy-MM-dd'))}
                />
              )}
            />
          </div>
          <div className="flex-1">
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  customInput={<TextField id="endDate" label="endDate" />}
                  {...field}
                  onChange={(date: Date) => setValue('endDate', format(date, 'yyyy-MM-dd'))}
                />
              )}
            />
          </div>
        </div>
        <fieldset className="flex flex-row items-center gap-2">
          <input id="featured" type="checkbox" {...register('featured')} />
          <label htmlFor="featured">Featured</label>
        </fieldset>
        <Button primary type="submit">Save</Button>
      </div>
    </form>
  );
};
