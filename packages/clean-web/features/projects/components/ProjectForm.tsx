import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconLoader } from '@tabler/icons';

import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';

export const projectInputSchema = z.object({
  client: z.string(),
  location: z.string().optional(),
  position: z.string(),
  summary: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.object({
    description: z.string(),
  })).optional(),
  categories: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    rate: z.number().optional(),
  })).optional(),
  featured: z.boolean().optional(),
  contact: z.object({
    company: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type ProjectFormData = z.infer<typeof projectInputSchema>;

export interface ProjectFormProps {
  loading?: boolean;
  onSubmit: (data: ProjectFormData) => void;
  defaultValues?: ProjectFormData;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, defaultValues, loading }) => {

  const [showContacts, setShowContacts] = useState(
    defaultValues ? Object.values(defaultValues.contact ?? {}).filter(Boolean).length > 0: false
  );

  const { setValue, handleSubmit, register, control, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues,
    resolver: zodResolver(projectInputSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'highlights',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="shadow sm:rounded-sm">
        <div className="flex flex-col gap-4 space-y-1 bg-white p-4 dark:bg-zinc-800">
          <TextField id="client" label="Client" {...register('client')} />
          {errors.client &&
            <p className="text-red-500">{errors.client.message}</p>
          }
          <TextField id="location" label="Location" {...register('location')} />
          <TextField id="position" label="Position" {...register('position')} />
          <TextArea id="summary" label="Summary" {...register('summary')} />
          <div className="flex gap-2">
            <div className="flex-1">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    customInput={<TextField id="startDate" label="Start Date" />}
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
                    customInput={<TextField id="endDate" label="End Date" />}
                    {...field}
                    onChange={(date: Date) => setValue('endDate', format(date, 'yyyy-MM-dd'))}
                  />
                )}
              />
            </div>
          </div>
          <fieldset className="flex flex-col gap-2">
            <div className="flex items-center">
              <legend className="flex-1">Highlights</legend>
              <div className="flex-none">
                <Button onClick={() => append({ description: '' })}>Add</Button>
              </div>
            </div>
            {fields.map((field, index) => (
              <div className="flex items-center gap-6" key={field.id}>
                <div className="flex-1">
                  <TextField defaultValue={field.description} {...register(`highlights.${index}.description`)} />
                </div>
                <div className="flex-none">
                  <Button
                    onClick={() => remove(index)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </fieldset>
          <div className="flex flex-row items-center gap-2">
            <input id="featured" type="checkbox" {...register('featured')} />
            <label className="flex-1" htmlFor="featured">Featured</label>
            <input
              checked={showContacts}
              id="contact"
              onChange={e => {
                e.currentTarget.checked ? setShowContacts(true) : setShowContacts(false);
              }}
              type="checkbox"
            />
            <label className="flex-1" htmlFor="contact">Contact</label>
          </div>
          {showContacts && (
            <div className="grid grid-cols-2">
              <TextField id="company" label="company" {...register('contact.company')} />
              <TextField id="firstName" label="firstName" {...register('contact.firstName')} />
              <TextField id="lastName" label="lastName" {...register('contact.lastName')} />
              <TextField id="email" label="email" {...register('contact.email')} />
              <TextField id="street" label="street" {...register('contact.street')} />
              <TextField id="city" label="city" {...register('contact.city')} />
              <TextField id="zip" label="zip" {...register('contact.zip')} />
              <TextField id="country" label="country" {...register('contact.country')} />
            </div>
          )}
          <Button>Cancel</Button>
          <Button disabled={loading} primary type="submit">
            <span className="flex items-center justify-center gap-4">
              {loading && (
                <IconLoader className="animate-spin-slow h-5 w-5" />
              )}
              Save
            </span>
          </Button>
        </div>
      </div>
    </form>
  );
};
