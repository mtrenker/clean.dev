import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IconLoader } from '@tabler/icons';

import { Button } from '../../../common/components/Button';
import { TextArea } from '../../../common/components/TextArea';
import { TextField } from '../../../common/components/TextField';

const projectSchema = yup.object().shape({
  project: yup.object().shape({
    client: yup.string().required(),
    position: yup.string().required(),
    summary: yup.string().required(),
    location: yup.string().optional(),
    startDate: yup.date().optional(),
    endDate: yup.date().optional(),
    featured: yup.boolean().optional(),
  }),
  contact: yup.object().shape({
    company: yup.string().optional(),
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
    email: yup.string().optional(),
    street: yup.string().optional(),
    city: yup.string().optional(),
    zip: yup.string().optional(),
    country: yup.string().optional(),
  }),
});

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

export interface ContactData {
  company?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
}

export interface ProjectFormData {
  project: ProjectData;
  contact: ContactData;
}

export interface ProjectFormProps {
  loading?: boolean;
  onSubmit: (data: ProjectFormData) => void;
  defaultValues?: ProjectFormData;
}



export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, defaultValues, loading }) => {
    const [showContacts, setShowContacts] = useState(
    defaultValues ? Object.values(defaultValues.contact).filter(Boolean).length > 0: false
  );
  const { setValue, handleSubmit, register, control, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues,
    resolver: yupResolver(projectSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 rounded border bg-zinc-800 p-4">
        <TextField id="client" label="client" {...register('project.client')} />
        {errors.project?.client &&
          <p className="text-red-500">{errors.project.client.message}</p>
        }
        <TextField id="location" label="location" {...register('project.location')} />
        <TextField id="position" label="position" {...register('project.position')} />
        <TextArea id="summary" label="summary" {...register('project.summary')} />
        <div className="flex gap-2">
          <div className="flex-1">
            <Controller
              control={control}
              name="project.startDate"
              render={({ field }) => (
                <DatePicker
                  customInput={<TextField id="startDate" label="startDate" />}
                  {...field}
                  onChange={(date: Date) => setValue('project.startDate', format(date, 'yyyy-MM-dd'))}
                />
              )}
            />
          </div>
          <div className="flex-1">
            <Controller
              control={control}
              name="project.endDate"
              render={({ field }) => (
                <DatePicker
                  customInput={<TextField id="endDate" label="endDate" />}
                  {...field}
                  onChange={(date: Date) => setValue('project.endDate', format(date, 'yyyy-MM-dd'))}
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <input id="featured" type="checkbox" {...register('project.featured')} />
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
        <Button disabled={loading} primary type="submit">
          <span className="flex items-center justify-center gap-4">
            {loading && (
              <IconLoader className="animate-spin-slow h-5 w-5" />
            )}
            Save
          </span>
        </Button>
      </div>
    </form>
  );
};
