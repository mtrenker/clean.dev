'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

// In-memory rate limiter: max 3 submissions per IP per 15 minutes
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateEntry>();

const engagementTypes = [
  'embedded-technical-lead',
  'solutions-architecture',
  'architecture-delivery-assessment',
  'ai-engineering-advisory',
  'senior-implementation-support',
  'not-sure-yet',
] as const;

const engagementTypeLabels: Record<typeof engagementTypes[number], string> = {
  'embedded-technical-lead': 'Embedded Technical Lead',
  'solutions-architecture': 'Solutions Architecture',
  'architecture-delivery-assessment': 'Architecture and Delivery Assessment',
  'ai-engineering-advisory': 'AI-enabled Engineering Advisory',
  'senior-implementation-support': 'Senior Implementation Support',
  'not-sure-yet': 'Not sure yet',
};

export type ContactField =
  | 'name'
  | 'email'
  | 'message'
  | 'company'
  | 'desiredStartDate'
  | 'expectedDaysPerWeek'
  | 'onsiteModel'
  | 'engagementType'
  | 'budgetRange';

type ContactFormValues = Partial<Record<ContactField, string>>;

export interface ContactFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  values?: ContactFormValues;
}

const contactFields: ContactField[] = [
  'name',
  'email',
  'message',
  'company',
  'desiredStartDate',
  'expectedDaysPerWeek',
  'onsiteModel',
  'engagementType',
  'budgetRange',
];

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
};

const optionalString = (maximum: number, message: string) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() ? value : undefined,
  z.string().trim().max(maximum, message).optional(),
);

const getMessages = (locale: string) => locale === 'de'
  ? {
      nameRequired: 'Bitte geben Sie Ihren Namen ein.',
      emailInvalid: 'Bitte geben Sie eine gültige geschäftliche E-Mail-Adresse ein.',
      messageMinimum: 'Bitte geben Sie mindestens 10 Zeichen ein.',
      messageMaximum: 'Die Nachricht darf höchstens 2000 Zeichen lang sein.',
      valueTooLong: 'Diese Angabe ist zu lang.',
      dateInvalid: 'Bitte geben Sie ein gültiges Datum ein.',
      engagementInvalid: 'Bitte wählen Sie eine gültige Engagement-Art aus.',
      rateLimited: 'Zu viele Anfragen. Bitte versuchen Sie es in 15 Minuten erneut.',
      configurationError: 'Server-Konfigurationsfehler. Bitte versuchen Sie es später erneut.',
      sendError: 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.',
    }
  : {
      nameRequired: 'Please enter your name.',
      emailInvalid: 'Please enter a valid work email address.',
      messageMinimum: 'Please enter at least 10 characters.',
      messageMaximum: 'The message must be 2000 characters or fewer.',
      valueTooLong: 'This value is too long.',
      dateInvalid: 'Please enter a valid date.',
      engagementInvalid: 'Please select a valid engagement type.',
      rateLimited: 'Too many requests. Please wait 15 minutes before trying again.',
      configurationError: 'Server configuration error. Please try again later.',
      sendError: 'The enquiry could not be sent. Please try again later.',
    };

const getContactSchema = (locale: string) => {
  const messages = getMessages(locale);

  return z.object({
    name: z.string().trim().min(1, messages.nameRequired).max(100, messages.valueTooLong),
    email: z.string().trim().email(messages.emailInvalid).max(254, messages.emailInvalid),
    message: z.string().trim().min(10, messages.messageMinimum).max(2000, messages.messageMaximum),
    company: optionalString(150, messages.valueTooLong),
    desiredStartDate: z.preprocess(
      (value) => typeof value === 'string' && value.trim() ? value : undefined,
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, messages.dateInvalid)
        .refine((value) => {
          const [year, month, day] = value.split('-').map(Number);
          const date = new Date(Date.UTC(year, month - 1, day));
          return date.getUTCFullYear() === year
            && date.getUTCMonth() === month - 1
            && date.getUTCDate() === day;
        }, messages.dateInvalid)
        .optional(),
    ),
    expectedDaysPerWeek: optionalString(50, messages.valueTooLong),
    onsiteModel: optionalString(100, messages.valueTooLong),
    engagementType: z.preprocess(
      (value) => typeof value === 'string' && value ? value : undefined,
      z.enum(engagementTypes, { message: messages.engagementInvalid }).optional(),
    ),
    budgetRange: optionalString(100, messages.valueTooLong),
  });
};

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderEmailRow = (label: string, value: string | undefined): string => value
  ? `<p><strong>${label}:</strong> ${escapeHtml(value).replace(/\n/g, '<br />')}</p>`
  : '';

export async function sendContactEmail(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: bots fill this hidden field — silently succeed to avoid detection
  const honeypot = formData.get('website');
  if (honeypot) {
    return { success: true };
  }

  const locale = formData.get('locale') === 'de' ? 'de' : 'en';
  const messages = getMessages(locale);
  const values = Object.fromEntries(contactFields.map((field) => {
    const value = formData.get(field);
    return [field, typeof value === 'string' ? value : ''];
  })) as ContactFormValues;

  // Rate limiting by IP
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (isRateLimited(ip)) {
    return { error: messages.rateLimited, values };
  }

  const parsed = getContactSchema(locale).safeParse(values);

  if (!parsed.success) {
    const fieldErrors: ContactFormState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField;
      fieldErrors[field] = issue.message;
    }
    return { fieldErrors, values };
  }

  const {
    name,
    email,
    message,
    company,
    desiredStartDate,
    expectedDaysPerWeek,
    onsiteModel,
    engagementType,
    budgetRange,
  } = parsed.data;

  try {
    const recipient = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!recipient) {
      console.error('Contact form: SMTP_FROM / SMTP_USER not configured');
      return { error: messages.configurationError, values };
    }

    const engagementTypeLabel = engagementType ? engagementTypeLabels[engagementType] : undefined;
    const subjectName = name.replace(/[\r\n]+/g, ' ');

    await sendEmail({
      to: recipient,
      subject: `Project enquiry from ${subjectName}`,
      html: [
        renderEmailRow('Name', name),
        renderEmailRow('Work email', email),
        renderEmailRow('Company', company),
        renderEmailRow('Desired start date', desiredStartDate),
        renderEmailRow('Expected days per week', expectedDaysPerWeek),
        renderEmailRow('Onsite model', onsiteModel),
        renderEmailRow('Engagement type', engagementTypeLabel),
        renderEmailRow('Budget or rate range', budgetRange),
        '<hr />',
        renderEmailRow('Project context', message),
      ].join('\n'),
    });

    return { success: true };
  } catch {
    // Do not log the error object: SMTP errors can contain submitted message data.
    console.error('Contact form email delivery failed');
    return { error: messages.sendError, values };
  }
}
