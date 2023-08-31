import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const SecretString = "test";
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token');
  if (token !== SecretString) {
    return new Response('Invalid token', { status: 401 })
  }
  draftMode().enable()
  return redirect('/');
}
