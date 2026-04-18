import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '@/test/render-with-intl';
import { MIN_FEEDBACK_LENGTH, ReviewForm } from './[token]/review-form';

function renderReviewFlow() {
  renderWithIntl(
    <ReviewForm
      token="header.payload.sig"
      callbackPath="/reviews/header.payload.sig"
      reviewerName="Manual Reviewer"
      reviewerEmail="manual@example.com"
      projectSlug="platform-refresh"
    />,
  );
}

function submitManualReview() {
  fireEvent.change(screen.getByRole('combobox', { name: /Relationship/i }), {
    target: { value: 'peer' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Your review/i }), {
    target: {
      value: 'Excellent collaboration and communication. '.repeat(
        Math.ceil(MIN_FEEDBACK_LENGTH / 40),
      ),
    },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Submission' }));
}

describe('review flow integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows manual-entry fallback copy when LinkedIn is unavailable', () => {
    renderReviewFlow();

    expect(screen.getByText(/LinkedIn is optional\./i)).toBeTruthy();
    expect(screen.getByText(/Use the manual form below to submit without it\./i)).toBeTruthy();
  });

  it('delivers successful submission through manual form path', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    renderReviewFlow();
    submitManualReview();

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

  it('surfaces rate-limit rejection from submit API', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Too many requests. Please try again later.' }),
    } as Response);

    renderReviewFlow();
    submitManualReview();

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('Too many requests');
  });
});
