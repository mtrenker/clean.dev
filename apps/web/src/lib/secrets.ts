import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsManagerClient = new SecretsManagerClient();

export const getSecret = async (secretId: string, fallbackEnv: string) => {
  if (process.env.NODE_ENV === 'production') {
    const { SecretString } = await secretsManagerClient.send(
      new GetSecretValueCommand({
        SecretId: secretId,
      })
    );
    return SecretString;
  }
  return process.env[fallbackEnv] || '';
};
