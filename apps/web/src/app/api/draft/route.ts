import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretClient = new SecretsManagerClient();

export async function GET(request: Request) {
  const { SecretString } = await secretClient.send(new GetSecretValueCommand({
    SecretId: 'DraftModeSecret',
  }));
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token');
  if (token !== SecretString) {
    return new Response('Invalid token', { status: 401 })
  }
  draftMode().enable()
  return redirect('/');
}
