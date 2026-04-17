import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserMenu } from './user-menu';
import { renderWithIntl } from '@/test/render-with-intl';

describe('user menu integration', () => {
  it('renders critical backoffice links when opened', () => {
    renderWithIntl(
      <UserMenu
        session={{
          expires: '2999-01-01T00:00:00.000Z',
          user: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            image: null,
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'User menu for Jane Doe' }));

    expect(screen.getByRole('menuitem', { name: 'Client Management' }).getAttribute('href')).toBe('/clients');
    expect(screen.getByRole('menuitem', { name: 'Time Tracking' }).getAttribute('href')).toBe('/time');
    expect(screen.getByRole('menuitem', { name: 'Invoice Management' }).getAttribute('href')).toBe('/invoices');
    expect(screen.getByRole('menuitem', { name: 'Settings' }).getAttribute('href')).toBe('/settings');
    expect(screen.getByRole('menuitem', { name: 'Administration' }).getAttribute('href')).toBe('/admin');
  });
});
