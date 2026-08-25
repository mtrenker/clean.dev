import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import deMessages from '@/messages/de.json';
import { renderWithIntl } from '@/test/render-with-intl';
import ContactPage, { PROTON_BOOKING_URL } from './page';

const { headersMock, cookiesMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

describe('contact page booking journey', () => {
  beforeEach(() => {
    headersMock.mockResolvedValue({ get: vi.fn(() => null) });
    cookiesMock.mockResolvedValue({ get: vi.fn(() => undefined) });
  });

  it('offers the exact external Proton booking destination and keeps the contact form available', async () => {
    renderWithIntl(await ContactPage());

    const booking = screen.getByRole('link', {
      name: 'Book an introductory call in Proton Calendar (opens in a new tab)',
    });

    expect(booking.getAttribute('href')).toBe(PROTON_BOOKING_URL);
    expect(booking.getAttribute('target')).toBe('_blank');
    expect(booking.getAttribute('rel')).toBe('noreferrer noopener');
    expect(screen.getByRole('heading', { level: 1, name: 'Tell me what needs to change' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Name' }).getAttribute('required')).toBe('');
    expect(screen.getByRole('textbox', { name: 'Work email' }).getAttribute('required')).toBe('');
    expect(screen.getByRole('textbox', { name: 'Message' }).getAttribute('required')).toBe('');

    for (const optionalField of [
      screen.getByRole('textbox', { name: 'Company (optional)' }),
      screen.getByLabelText('Desired start date (optional)'),
      screen.getByRole('textbox', { name: 'Expected days per week (optional)' }),
      screen.getByRole('textbox', { name: 'Onsite model (optional)' }),
      screen.getByRole('combobox', { name: 'Engagement type (optional)' }),
      screen.getByRole('textbox', { name: 'Budget or rate range (optional)' }),
    ]) {
      expect(optionalField.getAttribute('required')).toBeNull();
    }

    for (const option of [
      'Embedded Technical Lead',
      'Solutions Architecture',
      'Architecture and Delivery Assessment',
      'AI-enabled Engineering Advisory',
      'Senior Implementation Support',
      'Not sure yet',
    ]) {
      expect(screen.getByRole('option', { name: option })).toBeTruthy();
    }

    expect((screen.getByRole('button', { name: 'Send project context' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('localizes the booking action and form for German visitors', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => ({ value: 'de' })),
    });

    renderWithIntl(await ContactPage(), { locale: 'de', messages: deMessages });

    const booking = screen.getByRole('link', {
      name: 'Erstgespräch in Proton Calendar buchen (öffnet in einem neuen Tab)',
    });

    expect(booking.getAttribute('href')).toBe(PROTON_BOOKING_URL);
    expect(screen.getByRole('heading', { level: 1, name: 'Was soll sich ändern?' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Geschäftliche E-Mail' }).getAttribute('required')).toBe('');
    expect(screen.getByRole('combobox', { name: 'Engagement-Art (optional)' }).getAttribute('required')).toBeNull();
    expect(screen.getByRole('option', { name: 'Noch nicht sicher' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Projektkontext senden' }) as HTMLButtonElement).disabled).toBe(false);
  });
});
