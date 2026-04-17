import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImprintPage, { generateMetadata as generateImprintMetadata } from './imprint/page';
import PrivacyPage, { generateMetadata as generatePrivacyMetadata } from './privacy/page';

const { headersMock, cookiesMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

describe('legal page integration', () => {
  beforeEach(() => {
    headersMock.mockResolvedValue({ get: vi.fn(() => null) });
    cookiesMock.mockResolvedValue({ get: vi.fn(() => undefined) });
  });

  it('exposes expected metadata for legal pages', async () => {
    const imprintMetadata = await generateImprintMetadata();
    const privacyMetadata = await generatePrivacyMetadata();

    expect(imprintMetadata.title).toBe('Imprint | clean.dev');
    expect(privacyMetadata.alternates?.canonical).toBe('/privacy');
  });

  it('renders imprint page and keeps legal contact/access links visible', async () => {
    render(await ImprintPage());

    expect(screen.getByRole('heading', { level: 1, name: 'Imprint' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'clean.dev/contact' }).getAttribute('href')).toBe('/contact');
    const emailLinks = screen.getAllByRole('link', { name: 'info@clean.dev' });
    expect(emailLinks.length).toBeGreaterThan(0);
    expect(emailLinks[0]?.getAttribute('href')).toBe('mailto:info@clean.dev');
  });

  it('renders privacy page in default locale fallback and links to contact/imprint', async () => {
    render(await PrivacyPage());

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'contact form' }).getAttribute('href')).toBe('/contact');
    expect(screen.getByRole('link', { name: 'Imprint' }).getAttribute('href')).toBe('/imprint');
  });
});
