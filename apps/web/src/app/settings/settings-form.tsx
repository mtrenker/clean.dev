'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { UpdateSettings, Settings } from '@cleandev/pm';
import { updateSettingsAction } from './actions';

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
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium" htmlFor="contractorName">
          Name *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="contractorName"
          required
          type="text"
          {...register('contractorName', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="contractorAddress">
          Adresse *
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          id="contractorAddress"
          required
          rows={3}
          {...register('contractorAddress', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="bankName">
          Bank Name *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="bankName"
          required
          type="text"
          {...register('bankName', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="bankIban">
          IBAN *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="bankIban"
          required
          type="text"
          {...register('bankIban', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="bankBic">
          BIC *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="bankBic"
          required
          type="text"
          {...register('bankBic', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="vatId">
          USt-ID *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="vatId"
          required
          type="text"
          {...register('vatId', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="defaultHourlyRate">
          Standard Stundensatz (EUR) *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="defaultHourlyRate"
          required
          step="0.01"
          type="number"
          {...register('defaultHourlyRate', { required: true })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="defaultTaxRate">
          Standard Steuersatz (z.B. 0.19 für 19%) *
        </label>
        <input
          className="mt-1 w-full rounded border p-2"
          id="defaultTaxRate"
          required
          step="0.0001"
          type="number"
          {...register('defaultTaxRate', { required: true })}
        />
      </div>

      <button
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        type="submit"
      >
        Einstellungen speichern
      </button>
    </form>
  );
};
