/**
 * Review delivery helper.
 *
 * Formats a validated review submission and forwards it to the configured
 * destination via SMTP.  No data is written to the application database.
 *
 * Required env vars:
 *   REVIEW_RECIPIENT_EMAIL  – address that should receive submitted reviews
 */
import { sendEmail } from './email';

// ── Types ──────────────────────────────────────────────────────────────────────

/** LinkedIn-authenticated identity attached to a submission. */
export interface LinkedInIdentity {
  /** LinkedIn display name (may differ from token name). */
  name: string | null;
  /** LinkedIn profile image URL. */
  image: string | null;
  /** LinkedIn subject identifier. */
  sub: string;
}

/** Fully assembled review submission ready for delivery. */
export interface ReviewSubmission {
  /** Context extracted from the verified deep-link token. */
  token: {
    sub: string;
    name: string;
    email: string;
    projectSlug: string;
  };
  /** Sanitised form values supplied by the reviewer. */
  form: {
    name: string;
    email: string;
    role: string;
    relationship: string;
    feedback: string;
  };
  /** LinkedIn-authenticated identity enrichment, when the reviewer signed in. */
  linkedin?: LinkedInIdentity;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildEmailHtml(submission: ReviewSubmission): string {
  const { token, form, linkedin } = submission;

  const linkedinRows = linkedin
    ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:35%">LinkedIn sub</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(linkedin.sub)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">LinkedIn name</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(linkedin.name ?? 'n/a')}</td>
      </tr>`
    : '';

  const roleRow = form.role
    ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:35%">Role</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(form.role)}</td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Review – ${escapeHtml(token.projectSlug)}</title></head>
<body style="font-family:sans-serif;color:#111;max-width:640px;margin:0 auto;padding:24px">
  <h1 style="font-size:1.5rem;margin-bottom:4px">New Review Submission</h1>
  <p style="color:#666;margin-top:0">Project: <strong>${escapeHtml(token.projectSlug)}</strong></p>

  <h2 style="font-size:1.1rem;margin-top:24px;margin-bottom:8px">Token Identity</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:35%">Subject</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(token.sub)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Name</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(token.name)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Email</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(token.email)}</td>
    </tr>
    ${linkedinRows}
  </table>

  <h2 style="font-size:1.1rem;margin-top:24px;margin-bottom:8px">Reviewer-supplied Details</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:35%">Name</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(form.name)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Email</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(form.email)}</td>
    </tr>
    ${roleRow}
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Relationship</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(form.relationship)}</td>
    </tr>
  </table>

  <h2 style="font-size:1.1rem;margin-top:24px;margin-bottom:8px">Feedback</h2>
  <div style="background:#f9f9f9;border-left:4px solid #ddd;padding:16px;white-space:pre-wrap">${escapeHtml(form.feedback)}</div>

  <p style="color:#999;font-size:0.75rem;margin-top:32px">
    Submitted via review link at ${new Date().toISOString()}
  </p>
</body>
</html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Forwards a validated review submission to the configured recipient email.
 *
 * The review is delivered via SMTP and never written to the application
 * database.  Call this only after validating and token-verifying the input.
 *
 * @param submission  Assembled review data including token context and form values.
 * @throws When `REVIEW_RECIPIENT_EMAIL` is not configured or SMTP delivery fails.
 */
export async function deliverReview(submission: ReviewSubmission): Promise<void> {
  const recipient = process.env.REVIEW_RECIPIENT_EMAIL;
  if (!recipient) {
    throw new Error(
      'REVIEW_RECIPIENT_EMAIL environment variable is not set. ' +
        'Set it to the address that should receive submitted reviews.',
    );
  }

  const subject = `New Review – ${submission.token.projectSlug} from ${submission.form.name}`;
  const html = buildEmailHtml(submission);

  await sendEmail({ to: recipient, subject, html });
}
