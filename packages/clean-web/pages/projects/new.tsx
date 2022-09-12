import { NextPage } from 'next';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { Button } from '../../common/components/Button';
import { TextArea } from '../../common/components/TextArea';
import { TextField } from '../../common/components/TextField';

import 'react-datepicker/dist/react-datepicker.css';

interface ProjectInput {
  client: string;
  location?: string;
  position: string;
  summary?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
  featured?: boolean;
}

const NewProjectPage: NextPage = () => {
  const { control, handleSubmit, register, setValue } = useForm<ProjectInput>();

  const onSubmit = (input: ProjectInput) => {
    console.log({ input });
  };

  return (
    <main className="container mx-auto max-w-md p-4">
      <h1>New Project</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="rounded border bg-zinc-800 p-4">
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
                    onChange={(date) => setValue('startDate', date?.toISOString())}
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
                    onChange={(date) => setValue('endDate', date?.toISOString())}
                  />
                )}
              />
            </div>
          </div>
          <fieldset className="flex flex-row items-center gap-2">
            <input id="featured" type="checkbox" {...register('featured')} />
            <label htmlFor="featured">Featured</label>
          </fieldset>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </main>
  );
};

export default NewProjectPage;
