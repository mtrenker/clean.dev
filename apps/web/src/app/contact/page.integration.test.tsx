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
    expect(screen.getByRole('textbox', { name: 'Name' }).getAttribute('required')).toBe('');
    expect(screen.getByRole('textbox', { name: 'Email' }).getAttribute('required')).toBe('');
    expect(screen.getByRole('textbox', { name: 'Message' }).getAttribute('required')).toBe('');
    expect((screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled).toBe(false);
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
    expect(screen.getByRole('textbox', { name: 'E-Mail' }).getAttribute('required')).toBe('');
    expect((screen.getByRole('button', { name: 'Nachricht senden' }) as HTMLButtonElement).disabled).toBe(false);
  });
});
