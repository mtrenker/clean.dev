'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { UpdateSettings, Settings } from '@cleandev/pm';
import { updateSettingsAction } from './actions';
import { Input, Textarea, FormField, Button } from '@/components/ui';

interface SettingsFormProps {
  settings: Settings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings }) => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<UpdateSettings>({
    defaultValues: {
      contractorName: settings.contractorName,
      contractorAddress: settings.contractorAddress,
      bankName: settings.bankName,
      bankIban: settings.bankIban,
      bankBic: settings.bankBic,
      vatId: settings.vatId,
      defaultHourlyRate: settings.defaultHourlyRate,
      defaultTaxRate: settings.defaultTaxRate,
    },
  });

  const onSubmit = async (data: UpdateSettings) => {
    try {
      await updateSettingsAction(data);
      alert('Einstellungen erfolgreich gespeichert!');
      router.refresh();
    } catch (error) {
      alert('Fehler beim Speichern der Einstellungen');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Name" htmlFor="contractorName" required>
        <Input
          id="contractorName"
          type="text"
          required
          {...register('contractorName', { required: true })}
        />
      </FormField>

      <FormField label="Adresse" htmlFor="contractorAddress" required>
        <Textarea
          id="contractorAddress"
          required
          rows={3}
          {...register('contractorAddress', { required: true })}
        />
      </FormField>

      <FormField label="Bank Name" htmlFor="bankName" required>
        <Input
          id="bankName"
          type="text"
          required
          {...register('bankName', { required: true })}
        />
      </FormField>

      <FormField label="IBAN" htmlFor="bankIban" required>
        <Input
          id="bankIban"
          type="text"
          required
          {...register('bankIban', { required: true })}
        />
      </FormField>

      <FormField label="BIC" htmlFor="bankBic" required>
        <Input
          id="bankBic"
          type="text"
          required
          {...register('bankBic', { required: true })}
        />
      </FormField>

      <FormField label="USt-ID" htmlFor="vatId" required>
        <Input
          id="vatId"
          type="text"
          required
          {...register('vatId', { required: true })}
        />
      </FormField>

      <FormField label="Standard Stundensatz (EUR)" htmlFor="defaultHourlyRate" required>
        <Input
          id="defaultHourlyRate"
          type="number"
          step="0.01"
          required
          {...register('defaultHourlyRate', { required: true })}
        />
      </FormField>

      <FormField label="Standard Steuersatz (z.B. 0.19 für 19%)" htmlFor="defaultTaxRate" required>
        <Input
          id="defaultTaxRate"
          type="number"
          step="0.0001"
          required
          {...register('defaultTaxRate', { required: true })}
        />
      </FormField>

      <Button type="submit" variant="primary">
        Einstellungen speichern
      </Button>
    </form>
  );
};
