import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

function getTransporter() {
  // Don't cache - always create fresh transporter with current env vars
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    throw new Error('SMTP configuration is missing');
  }

  const port = parseInt(process.env.SMTP_PORT, 10);

  // Port 465 uses direct SSL, port 587 uses STARTTLS
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: port === 587,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
    tls: {
      // Don't fail on invalid certs in development
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production',
  });
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transporter = getTransporter();

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error('SMTP_FROM or SMTP_USER must be configured');
  }

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}
