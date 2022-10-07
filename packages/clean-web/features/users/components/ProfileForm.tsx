import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../common/components/Button';
import { TextField } from '../../../common/components/TextField';

export interface ProfileFormProps {
  className?: string;
  onSubmit: (data: any) => void;
}

export const profileInputSchema = z.object({
  contact: z.object({
    company: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }),
});

export type ProfileFormData = z.infer<typeof profileInputSchema>;


export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const { handleSubmit, register } = useForm<ProfileFormData>();
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-1/2 flex-col gap-4 rounded-sm">
          <div>
            <TextField id="firstName" label="firstName" {...register('contact.firstName')} />
          </div>
          <div>
            <TextField id="lastName" label="lastName" {...register('contact.lastName')} />
          </div>
          <div>
            <TextField id="email" label="email" {...register('contact.email')} />
          </div>
          <div>
            <TextField id="company" label="company" {...register('contact.company')} />
          </div>
          <div>
            <TextField id="street" label="street" {...register('contact.street')} />
          </div>
          <div>
            <TextField id="zip" label="zip" {...register('contact.zip')} />
          </div>
          <div>
            <TextField id="country" label="country" {...register('contact.country')} />
          </div>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};
