import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewTokenError } from '@/lib/review-links';
import ReviewPage from './page';

const { authMock, headersMock, cookiesMock, verifyReviewTokenMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  headersMock: vi.fn(),
  cookiesMock: vi.fn(),
  verifyReviewTokenMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

vi.mock('auth', () => ({
  auth: authMock,
}));

vi.mock('@/lib/review-links', async () => {
  const actual = await vi.importActual<typeof import('@/lib/review-links')>('@/lib/review-links');
  return {
    ...actual,
    verifyReviewToken: verifyReviewTokenMock,
  };
});

vi.mock('./review-form', () => ({
  ReviewForm: ({
    callbackPath,
    reviewerName,
  }: {
    callbackPath: string;
    reviewerName: string;
  }) => (
    <div>
      <p>{reviewerName}</p>
      <p>{callbackPath}</p>
      <button type="button">Continue with LinkedIn</button>
    </div>
  ),
}));

describe('review page integration', () => {
  beforeEach(() => {
    authMock.mockResolvedValue(null);
    headersMock.mockResolvedValue({ get: vi.fn(() => null) });
    cookiesMock.mockResolvedValue({ get: vi.fn(() => undefined) });
    verifyReviewTokenMock.mockReset();
  });

  it('renders personalized review form for a valid token', async () => {
    verifyReviewTokenMock.mockReturnValue({
      sub: 'rev-1',
      name: 'Jane Reviewer',
      email: 'jane@example.com',
      projectSlug: 'platform-refresh',
    });

    render(await ReviewPage({ params: Promise.resolve({ token: 'valid-token' }) }));

    expect(screen.getByRole('heading', { level: 1, name: 'Share Your Experience' })).toBeTruthy();
    expect(screen.getByText(/Hi Jane Reviewer, thanks for reviewing collaboration/)).toBeTruthy();
    expect(screen.getByText('/reviews/valid-token')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with LinkedIn' })).toBeTruthy();
  });

  it('renders invalid-link state for malformed or tampered tokens', async () => {
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('invalid signature', 'INVALID_SIGNATURE');
    });

    render(await ReviewPage({ params: Promise.resolve({ token: 'broken' }) }));

    expect(screen.getByRole('heading', { level: 3, name: 'This review link is invalid' })).toBeTruthy();
  });

  it('renders expired-link state for expired tokens', async () => {
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('expired', 'EXPIRED');
    });

    render(await ReviewPage({ params: Promise.resolve({ token: 'expired' }) }));

    expect(screen.getByRole('heading', { level: 3, name: 'This review link has expired' })).toBeTruthy();
  });

  it('renders disabled-feature state when review links are turned off', async () => {
    verifyReviewTokenMock.mockImplementation(() => {
      throw new ReviewTokenError('disabled', 'DISABLED');
    });

    render(await ReviewPage({ params: Promise.resolve({ token: 'disabled' }) }));

    expect(screen.getByRole('heading', { level: 3, name: 'Reviews are temporarily unavailable' })).toBeTruthy();
  });
});
