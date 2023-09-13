import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSecret } from '../../../lib/secrets';

export const GET = async (request: Request): Promise<Response> => {

  const secret = await getSecret('clean/blog/draft-mode-secret', 'DRAFT_MODE_SECRET');

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');
  if (token !== secret) {
    return new Response('Invalid token', { status: 401 });
  }
  draftMode().enable();
  return redirect(`/blog/${slug}`);
}
