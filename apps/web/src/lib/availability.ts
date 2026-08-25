import type { Locale } from '@/lib/locale';

interface AvailabilityCopy {
  label: string;
  availableFrom: string;
  independentConsultant: string;
  daysPerWeek: string;
  location: string;
  languages: string;
}

export interface ConsultingAvailability {
  start: {
    year: number;
    month: number;
  };
  daysPerWeek: {
    minimum: number;
    maximum: number;
  };
  copy: Record<Locale, AvailabilityCopy>;
}

export interface LocalizedAvailability {
  label: string;
  eyebrow: string;
  start: string;
  schedule: string;
  location: string;
  languages: string;
  summary: string;
  dossierSummary: string;
}

export const consultingAvailability: ConsultingAvailability = {
  start: {
    year: 2026,
    month: 9,
  },
  daysPerWeek: {
    minimum: 2,
    maximum: 5,
  },
  copy: {
    en: {
      label: 'Availability',
      availableFrom: 'Available from',
      independentConsultant: 'Independent consultant',
      daysPerWeek: 'days/week',
      location: 'Munich and remote DACH',
      languages: 'German and English',
    },
    de: {
      label: 'Verfügbarkeit',
      availableFrom: 'Verfügbar ab',
      independentConsultant: 'Freier Consultant',
      daysPerWeek: 'Tage/Woche',
      location: 'München und remote im DACH-Raum',
      languages: 'Deutsch und Englisch',
    },
  },
};

export const getConsultingAvailability = (locale: Locale): LocalizedAvailability => {
  const { start, daysPerWeek, copy } = consultingAvailability;
  const localizedCopy = copy[locale];
  const startDate = new Date(Date.UTC(start.year, start.month - 1, 1));
  const localizedStart = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(startDate);
  const schedule = `${daysPerWeek.minimum}–${daysPerWeek.maximum} ${localizedCopy.daysPerWeek}`;
  const summary = `${localizedCopy.availableFrom} ${localizedStart} · ${schedule} · ${localizedCopy.languages}`;

  return {
    label: localizedCopy.label,
    eyebrow: `${localizedCopy.independentConsultant} · ${localizedCopy.location}`,
    start: localizedStart,
    schedule,
    location: localizedCopy.location,
    languages: localizedCopy.languages,
    summary,
    dossierSummary: `${localizedCopy.availableFrom} ${localizedStart} · ${schedule} · ${localizedCopy.location} · ${localizedCopy.languages}`,
  };
};
