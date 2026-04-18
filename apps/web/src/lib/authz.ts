import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';

export function isAdminSession(session: Session | null | undefined): boolean {
  return session?.user?.role === 'admin';
}

export function requireAdminSession(
  session: Session | null | undefined,
  callbackUrl?: string,
): asserts session is Session {
  if (!session) {
    const signInUrl = callbackUrl
      ? `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/api/auth/signin';
    redirect(signInUrl);
  }

  if (!isAdminSession(session)) {
    redirect('/');
  }
}
