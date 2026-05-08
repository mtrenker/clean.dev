import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArchiveReviewForm } from './archive-review-form';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));
const setTaskArchiveReviewAction = vi.fn();
const setPlanArchiveReviewAction = vi.fn();
vi.mock('@/app/cockpit/actions', () => ({
  setTaskArchiveReviewAction: (...args: unknown[]) => setTaskArchiveReviewAction(...args),
  setPlanArchiveReviewAction: (...args: unknown[]) => setPlanArchiveReviewAction(...args),
}));

beforeEach(() => {
  refresh.mockClear();
  setTaskArchiveReviewAction.mockReset();
  setPlanArchiveReviewAction.mockReset();
});

describe('ArchiveReviewForm', () => {
  it('submits the task verdict with notes and refreshes the route', async () => {
    setTaskArchiveReviewAction.mockResolvedValueOnce(undefined);
    render(
      <ArchiveReviewForm
        target={{ kind: 'task', projectId: 'proj-a', taskId: 't-1' }}
        currentStatus="pending"
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/marking this as reviewed/i), {
      target: { value: 'looks good' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Mark reviewed/i }));

    await waitFor(() => {
      expect(setTaskArchiveReviewAction).toHaveBeenCalledWith({
        projectId: 'proj-a',
        taskId: 't-1',
        reviewStatus: 'reviewed',
        reviewNotes: 'looks good',
      });
      expect(refresh).toHaveBeenCalled();
    });
  });

  it('shows the Re-open button only when current status is not pending', () => {
    const { rerender } = render(
      <ArchiveReviewForm
        target={{ kind: 'task', projectId: 'proj-a', taskId: 't-1' }}
        currentStatus="pending"
      />,
    );
    expect(screen.queryByRole('button', { name: /Re-open/ })).toBeNull();
    rerender(
      <ArchiveReviewForm
        target={{ kind: 'task', projectId: 'proj-a', taskId: 't-1' }}
        currentStatus="reviewed"
      />,
    );
    expect(screen.queryByRole('button', { name: /Re-open/ })).not.toBeNull();
  });

  it('routes plan verdicts to setPlanArchiveReviewAction', async () => {
    setPlanArchiveReviewAction.mockResolvedValueOnce(undefined);
    render(
      <ArchiveReviewForm
        target={{ kind: 'plan', projectId: 'proj-a', planId: 'plan-1' }}
        currentStatus="pending"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Dismiss/i }));
    await waitFor(() => {
      expect(setPlanArchiveReviewAction).toHaveBeenCalledWith({
        projectId: 'proj-a',
        planId: 'plan-1',
        reviewStatus: 'dismissed',
        reviewNotes: null,
      });
    });
  });
});
