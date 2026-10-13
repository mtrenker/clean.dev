import { describe, expect, it } from 'vitest';
import { consultingAvailability, getConsultingAvailability } from './availability';

describe('consulting availability', () => {
  it('builds the approved English availability line from typed facts', () => {
    const availability = getConsultingAvailability('en');

    expect(availability.status).toBe('Available');
    expect(consultingAvailability.daysPerWeek).toEqual({ minimum: 2, maximum: 5 });
    expect(availability.summary).toBe(
      'Available · 2–5 days/week · German and English',
    );
    expect(availability.eyebrow).toBe('Independent consultant · Munich and remote DACH');
  });

  it('expresses the same operating model naturally in German', () => {
    const availability = getConsultingAvailability('de');

    expect(availability.summary).toBe(
      'Verfügbar · 2–5 Tage/Woche · Deutsch und Englisch',
    );
    expect(availability.dossierSummary).toContain('München und remote im DACH-Raum');
  });
});
