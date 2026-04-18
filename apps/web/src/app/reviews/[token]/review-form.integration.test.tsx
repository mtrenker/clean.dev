import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/render-with-intl';
import { MIN_FEEDBACK_LENGTH, ReviewForm } from './review-form';

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  signIn: signInMock,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Fill and submit the form with valid data. */
function fillAndSubmit() {
  fireEvent.change(screen.getByRole('combobox', { name: /Relationship/i }), {
    target: { value: 'client' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Your review/i }), {
    target: { value: 'Great collaboration. '.repeat(Math.ceil(MIN_FEEDBACK_LENGTH / 19)) },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Submission' }));
}

function renderForm() {
  renderWithIntl(
    <ReviewForm
      token="header.payload.sig"
      callbackPath="/reviews/abc-token"
      reviewerName="Jane Reviewer"
      reviewerEmail="jane@example.com"
      projectSlug="platform-refresh"
    />,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('review form integration', () => {
  it('starts LinkedIn sign-in and returns to the review route', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with LinkedIn' }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('linkedin', {
        redirectTo: '/reviews/abc-token',
      });
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      signInMock.mockReset();
      global.fetch = vi.fn();
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows validation errors when required fields are empty', () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: 'Continue to Submission' }));

      expect(screen.getByText(/Please select your relationship/i)).toBeTruthy();
      expect(screen.getByText(/Please provide at least/i)).toBeTruthy();
      expect(screen.getByText(/Please confirm consent/i)).toBeTruthy();
      // fetch should NOT have been called
      expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
    });
  });

  describe('submission – success', () => {
    beforeEach(() => {
      signInMock.mockReset();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('calls the submit API and shows the success state on 200', async () => {
      renderForm();
      fillAndSubmit();

      await waitFor(() =>
        expect(
          screen.getByRole('heading', { level: 3, name: 'Review submitted successfully' }),
        ).toBeTruthy(),
      );

      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        '/api/reviews/submit',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('includes the token in the request body', async () => {
      renderForm();
      fillAndSubmit();

      await waitFor(() =>
        screen.getByRole('heading', { level: 3, name: 'Review submitted successfully' }),
      );

      const [, init] = vi.mocked(global.fetch).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string) as { token: string };
      expect(body.token).toBe('header.payload.sig');
    });
  });

  describe('submission – error', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    beforeEach(() => {
      signInMock.mockReset();
    });

    it('shows an error message when the server returns a non-OK response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Token has expired' }),
      });

      renderForm();
      fillAndSubmit();

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeTruthy(),
      );
      expect(screen.getByRole('alert').textContent).toMatch(/Token has expired/i);
    });

    it('shows a generic error message when the network request fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderForm();
      fillAndSubmit();

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeTruthy(),
      );
      expect(screen.getByRole('alert').textContent).toMatch(
        /Something went wrong while submitting/i,
      );
    });
  });
});
