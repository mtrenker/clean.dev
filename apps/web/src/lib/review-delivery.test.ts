import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deliverReview, type ReviewSubmission } from './review-delivery';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseSubmission: ReviewSubmission = {
  token: {
    sub: 'rev-abc123',
    name: 'Alice Token',
    email: 'alice@example.com',
    projectSlug: 'acme-platform',
  },
  form: {
    name: 'Alice Reviewer',
    email: 'alice@example.com',
    role: 'Engineering Lead',
    relationship: 'client',
    feedback: 'Excellent work across the board. Clear communication and solid delivery.',
  },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('./email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('deliverReview', () => {
  beforeEach(() => {
    process.env.REVIEW_RECIPIENT_EMAIL = 'recipient@example.com';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
  });

  afterEach(() => {
    delete process.env.REVIEW_RECIPIENT_EMAIL;
    vi.clearAllMocks();
  });

  it('throws when REVIEW_RECIPIENT_EMAIL is not configured', async () => {
    delete process.env.REVIEW_RECIPIENT_EMAIL;
    await expect(deliverReview(baseSubmission)).rejects.toThrow(
      'REVIEW_RECIPIENT_EMAIL',
    );
  });

  it('calls sendEmail with the recipient address', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview(baseSubmission);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'recipient@example.com' }),
    );
  });

  it('includes the project slug in the subject line', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview(baseSubmission);
    const call = vi.mocked(sendEmail).mock.calls[0];
    expect(call).toBeDefined();
    const [opts] = call as Parameters<typeof sendEmail>;
    expect(opts.subject).toContain('acme-platform');
  });

  it('includes the reviewer name in the subject line', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview(baseSubmission);
    const [opts] = vi.mocked(sendEmail).mock.calls[0] as Parameters<typeof sendEmail>;
    expect(opts.subject).toContain('Alice Reviewer');
  });

  it('includes the feedback text in the email body', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview(baseSubmission);
    const [opts] = vi.mocked(sendEmail).mock.calls[0] as Parameters<typeof sendEmail>;
    expect(opts.html).toContain('Excellent work across the board');
  });

  it('includes LinkedIn identity when provided', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview({
      ...baseSubmission,
      linkedin: { name: 'Alice Li', image: null, sub: 'linkedin-sub-xyz' },
    });
    const [opts] = vi.mocked(sendEmail).mock.calls[0] as Parameters<typeof sendEmail>;
    expect(opts.html).toContain('linkedin-sub-xyz');
    expect(opts.html).toContain('Alice Li');
  });

  it('does not include a LinkedIn section when linkedin is absent', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview(baseSubmission);
    const [opts] = vi.mocked(sendEmail).mock.calls[0] as Parameters<typeof sendEmail>;
    expect(opts.html).not.toContain('LinkedIn sub');
  });

  it('HTML-escapes user-supplied content to prevent injection', async () => {
    const { sendEmail } = await import('./email');
    await deliverReview({
      ...baseSubmission,
      form: {
        ...baseSubmission.form,
        name: '<script>alert("xss")</script>',
        feedback: 'Safe feedback text with <b>bold</b> attempt',
      },
    });
    const [opts] = vi.mocked(sendEmail).mock.calls[0] as Parameters<typeof sendEmail>;
    expect(opts.html).not.toContain('<script>');
    expect(opts.html).toContain('&lt;script&gt;');
    expect(opts.html).not.toContain('<b>bold</b>');
    expect(opts.html).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });
});
