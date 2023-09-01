import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSecret } from '@/lib/secrets';

export async function GET(request: Request) {
  const secret = await getSecret('clean/blog/draft-mode-secret', 'DRAFT_MODE_SECRET');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (token !== secret) {
    return new Response('Invalid token', { status: 401 });
  }
  draftMode().enable();
  return redirect('/');
}
