import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../common/components/Button';
import { TextField } from '../../../common/components/TextField';
import { User } from '../../../graphql/generated';

export interface ProfileFormProps {
  className?: string;
  onSubmit: (data: any) => void;
  profile?: User
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
    bank: z.string().optional(),
    iban: z.string().optional(),
    bic: z.string().optional(),
    vat: z.string().optional(),
  }),
});

export type ProfileFormData = z.infer<typeof profileInputSchema>;


export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, profile }) => {

  const { handleSubmit, register, setValue } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile && profile.contact) {
      setValue('contact.bank', profile.contact.bank || '');
      setValue('contact.bic', profile.contact.bic || '');
      setValue('contact.city', profile.contact.city || '');
      setValue('contact.company', profile.contact.company || '');
      setValue('contact.country', profile.contact.country || '');
      setValue('contact.email', profile.contact.email || '');
      setValue('contact.firstName', profile.contact.firstName || '');
      setValue('contact.iban', profile.contact.iban || '');
      setValue('contact.lastName', profile.contact.lastName || '');
      setValue('contact.street', profile.contact.street || '');
      setValue('contact.zip', profile.contact.zip || '');
      setValue('contact.vat', profile.contact.zip || '');
    }
  }, [profile, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mx-auto flex w-1/2 flex-wrap gap-4">
        <fieldset className="flex-1">
          <legend>Contact Information</legend>
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
            <TextField id="city" label="city" {...register('contact.city')} />
          </div>
          <div>
            <TextField id="country" label="country" {...register('contact.country')} />
          </div>
        </fieldset>
        <fieldset className="flex-1">
          <legend>Bank Information</legend>
          <div>
            <TextField id="bank" label="bank" {...register('contact.bank')} />
          </div>
          <div>
            <TextField id="iban" label="iban" {...register('contact.iban')} />
          </div>
          <div>
            <TextField id="bic" label="bic" {...register('contact.bic')} />
          </div>
        </fieldset>
        <Button className="w-full shrink-0" type="submit">Submit</Button>
      </div>
    </form>
  );
};
