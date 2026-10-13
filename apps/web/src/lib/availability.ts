import type { Locale } from '@/lib/locale';

interface AvailabilityCopy {
  label: string;
  status: string;
  independentConsultant: string;
  daysPerWeek: string;
  location: string;
  languages: string;
}

export interface ConsultingAvailability {
  daysPerWeek: {
    minimum: number;
    maximum: number;
  };
  copy: Record<Locale, AvailabilityCopy>;
}

export interface LocalizedAvailability {
  label: string;
  eyebrow: string;
  status: string;
  schedule: string;
  location: string;
  languages: string;
  summary: string;
  dossierSummary: string;
}

export const consultingAvailability: ConsultingAvailability = {
  daysPerWeek: {
    minimum: 2,
    maximum: 5,
  },
  copy: {
    en: {
      label: 'Availability',
      status: 'Available',
      independentConsultant: 'Independent consultant',
      daysPerWeek: 'days/week',
      location: 'Munich and remote DACH',
      languages: 'German and English',
    },
    de: {
      label: 'Verfügbarkeit',
      status: 'Verfügbar',
      independentConsultant: 'Freier Consultant',
      daysPerWeek: 'Tage/Woche',
      location: 'München und remote im DACH-Raum',
      languages: 'Deutsch und Englisch',
    },
  },
};

export const getConsultingAvailability = (locale: Locale): LocalizedAvailability => {
  const { daysPerWeek, copy } = consultingAvailability;
  const localizedCopy = copy[locale];
  const schedule = `${daysPerWeek.minimum}–${daysPerWeek.maximum} ${localizedCopy.daysPerWeek}`;
  const summary = `${localizedCopy.status} · ${schedule} · ${localizedCopy.languages}`;

  return {
    label: localizedCopy.label,
    eyebrow: `${localizedCopy.independentConsultant} · ${localizedCopy.location}`,
    status: localizedCopy.status,
    schedule,
    location: localizedCopy.location,
    languages: localizedCopy.languages,
    summary,
    dossierSummary: `${localizedCopy.status} · ${schedule} · ${localizedCopy.location} · ${localizedCopy.languages}`,
  };
};
