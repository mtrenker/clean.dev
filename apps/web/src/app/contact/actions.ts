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

function isRateLimited(ip: string): boolean {
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
}

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be 2000 characters or fewer'),
});

export interface ContactFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>;
}

export async function sendContactEmail(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: bots fill this hidden field — silently succeed to avoid detection
  const honeypot = formData.get('website') as string;
  if (honeypot) {
    return { success: true };
  }

  // Rate limiting by IP
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (isRateLimited(ip)) {
    return {
      error: 'Too many requests. Please wait 15 minutes before trying again.',
    };
  }

  // Validate input
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as 'name' | 'email' | 'message';
      fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, message } = parsed.data;

  try {
    const recipient = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!recipient) {
      console.error('Contact form: SMTP_FROM / SMTP_USER not configured');
      return { error: 'Server configuration error. Please try again later.' };
    }

    await sendEmail({
      to: recipient,
      subject: `Contact form: message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error('Contact form sendEmail error:', err);
    return { error: 'Failed to send message. Please try again later.' };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
