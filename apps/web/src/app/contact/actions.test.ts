import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendContactEmail } from './actions';

const { headersMock, sendEmailMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
}));

vi.mock('@/lib/email', () => ({
  sendEmail: sendEmailMock,
}));

const requiredForm = () => {
  const formData = new FormData();
  formData.set('name', 'Ada Lovelace');
  formData.set('email', 'ada@example.com');
  formData.set('message', 'We need to make releases safer.');
  return formData;
};

const useIp = (ip: string) => {
  headersMock.mockResolvedValue({
    get: vi.fn((name: string) => name === 'x-forwarded-for' ? ip : null),
  });
};

describe('sendContactEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SMTP_FROM', 'info@clean.dev');
    sendEmailMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends a required-only enquiry and omits blank optional rows', async () => {
    useIp('192.0.2.1');

    const result = await sendContactEmail({}, requiredForm());

    expect(result).toEqual({ success: true });
    expect(sendEmailMock).toHaveBeenCalledOnce();
    const email = sendEmailMock.mock.calls[0]?.[0];
    expect(email.subject).toBe('Project enquiry from Ada Lovelace');
    expect(email.html).toContain('<strong>Work email:</strong> ada@example.com');
    expect(email.html).toContain('<strong>Project context:</strong> We need to make releases safer.');
    expect(email.html).not.toContain('<strong>Company:</strong>');
    expect(email.html).not.toContain('<strong>Engagement type:</strong>');
  });

  it('labels and escapes every optional value in a fully qualified enquiry', async () => {
    useIp('192.0.2.2');
    const formData = requiredForm();
    formData.set('name', 'Ada <Admin>');
    formData.set('company', 'Example & Co.');
    formData.set('desiredStartDate', '2026-10-01');
    formData.set('expectedDaysPerWeek', '2–3');
    formData.set('onsiteModel', 'Remote with <monthly> onsite');
    formData.set('engagementType', 'architecture-delivery-assessment');
    formData.set('budgetRange', '€10k–20k & flexible');
    formData.set('message', 'Review the system.\n<script>alert("no")</script>');

    const result = await sendContactEmail({}, formData);

    expect(result).toEqual({ success: true });
    const email = sendEmailMock.mock.calls[0]?.[0];
    expect(email.html).toContain('<strong>Company:</strong> Example &amp; Co.');
    expect(email.html).toContain('<strong>Desired start date:</strong> 2026-10-01');
    expect(email.html).toContain('<strong>Expected days per week:</strong> 2–3');
    expect(email.html).toContain('<strong>Onsite model:</strong> Remote with &lt;monthly&gt; onsite');
    expect(email.html).toContain('<strong>Engagement type:</strong> Architecture and Delivery Assessment');
    expect(email.html).toContain('<strong>Budget or rate range:</strong> €10k–20k &amp; flexible');
    expect(email.html).toContain('Review the system.<br />&lt;script&gt;alert(&quot;no&quot;)&lt;/script&gt;');
    expect(email.html).not.toContain('<script>');
  });

  it('rejects invalid optional values without sending email', async () => {
    useIp('192.0.2.3');
    const formData = requiredForm();
    formData.set('desiredStartDate', '2026-02-31');
    formData.set('engagementType', 'automatic-fit-decision');

    const result = await sendContactEmail({}, formData);

    expect(result.fieldErrors?.desiredStartDate).toBe('Please enter a valid date.');
    expect(result.fieldErrors?.engagementType).toBe('Please select a valid engagement type.');
    expect(result.values).toMatchObject({
      name: 'Ada Lovelace',
      desiredStartDate: '2026-02-31',
      engagementType: 'automatic-fit-decision',
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('localizes validation errors and does not log submitted context on delivery failure', async () => {
    useIp('192.0.2.4');
    const invalidForm = requiredForm();
    invalidForm.set('locale', 'de');
    invalidForm.set('email', 'not-an-email');

    const invalidResult = await sendContactEmail({}, invalidForm);
    expect(invalidResult.fieldErrors?.email).toBe('Bitte geben Sie eine gültige geschäftliche E-Mail-Adresse ein.');

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const validForm = requiredForm();
    validForm.set('message', 'Sensitive commercial project context');
    sendEmailMock.mockRejectedValueOnce(new Error('SMTP rejected Sensitive commercial project context'));

    const failureResult = await sendContactEmail({}, validForm);

    expect(failureResult.error).toBe('The enquiry could not be sent. Please try again later.');
    expect(failureResult.values?.message).toBe('Sensitive commercial project context');
    expect(consoleError).toHaveBeenCalledWith('Contact form email delivery failed');
    expect(consoleError.mock.calls.flat().join(' ')).not.toContain('Sensitive commercial project context');
  });
});
