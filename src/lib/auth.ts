/* eslint-disable @typescript-eslint/camelcase */
import API, { Auth } from 'aws-amplify';

API.configure({
  aws_cognito_region: process.env.AWS_REGION,
  aws_user_pools_id: process.env.COGNITO_POOL_ID,
  aws_user_pools_web_client_id: process.env.COGNITO_CLIENT_ID,
});

export async function SignIn(username: string, password: string): Promise<void> {
  try {
    const user = await Auth.signIn({
      username,
      password,
    });
    console.log(user);
  } catch (error) {
    console.log('error signing in', error);
  }
}
