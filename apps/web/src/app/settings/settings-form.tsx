'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import type { UpdateSettings, Settings } from '@cleandev/pm';
import { updateSettingsAction } from './actions';
import { Input, Textarea, FormField, Button } from '@/components/ui';

interface SettingsFormProps {
  settings: Settings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings }) => {
  const router = useRouter();
  const intl = useIntl();
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
      alert(intl.formatMessage({ id: 'settings.success' }));
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'settings.error' }));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField label={intl.formatMessage({ id: 'settings.form.name' })} htmlFor="contractorName" required>
        <Input
          id="contractorName"
          type="text"
          required
          {...register('contractorName', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.address' })} htmlFor="contractorAddress" required>
        <Textarea
          id="contractorAddress"
          required
          rows={3}
          {...register('contractorAddress', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.bankName' })} htmlFor="bankName" required>
        <Input
          id="bankName"
          type="text"
          required
          {...register('bankName', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.iban' })} htmlFor="bankIban" required>
        <Input
          id="bankIban"
          type="text"
          required
          {...register('bankIban', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.bic' })} htmlFor="bankBic" required>
        <Input
          id="bankBic"
          type="text"
          required
          {...register('bankBic', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.vatId' })} htmlFor="vatId" required>
        <Input
          id="vatId"
          type="text"
          required
          {...register('vatId', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.defaultRate' })} htmlFor="defaultHourlyRate" required>
        <Input
          id="defaultHourlyRate"
          type="number"
          step="0.01"
          required
          {...register('defaultHourlyRate', { required: true })}
        />
      </FormField>

      <FormField label={intl.formatMessage({ id: 'settings.form.defaultTaxRate' })} htmlFor="defaultTaxRate" required>
        <Input
          id="defaultTaxRate"
          type="number"
          step="0.0001"
          required
          {...register('defaultTaxRate', { required: true })}
        />
      </FormField>

      <Button type="submit" variant="primary">
        {intl.formatMessage({ id: 'settings.form.submit' })}
      </Button>
    </form>
  );
};
