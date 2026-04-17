import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminPanel } from './admin-panel';
import { renderWithIntl } from '@/test/render-with-intl';

describe('admin panel integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders core backoffice controls', () => {
    const { container } = renderWithIntl(<AdminPanel />);

    expect(screen.getByRole('heading', { name: 'Database Setup' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Run Setup' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'System Information' })).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('shows success result after a successful migration response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Migration completed' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    renderWithIntl(<AdminPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Setup' }));

    expect(await screen.findByText('Migration completed')).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/migrate', { method: 'POST' });
  });

  it('shows server error fallback details when migration fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'SQL syntax error near migration_003' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
    );

    renderWithIntl(<AdminPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Setup' }));

    expect(await screen.findByText('Setup failed')).toBeTruthy();
    expect(screen.getByText('SQL syntax error near migration_003')).toBeTruthy();
  });

  it('shows network error fallback when request throws', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network disconnected'));

    renderWithIntl(<AdminPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Setup' }));

    await waitFor(() => {
      expect(screen.getByText('Setup failed')).toBeTruthy();
      expect(screen.getByText('Network disconnected')).toBeTruthy();
    });
  });

  it('does not run migration when user cancels confirmation', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));

    renderWithIntl(<AdminPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Setup' }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Setup failed')).toBeNull();
  });
});
