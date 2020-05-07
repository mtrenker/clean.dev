/* eslint-disable @typescript-eslint/camelcase */
import API, { Auth } from 'aws-amplify';

export interface User {
  username: string;
}

API.configure({
  aws_cognito_region: process.env.AWS_REGION,
  aws_user_pools_id: process.env.COGNITO_POOL_ID,
  aws_user_pools_web_client_id: process.env.COGNITO_CLIENT_ID,
});

export async function signIn(username: string, password: string): Promise<User | null> {
  try {
    const user = await Auth.signIn({
      username,
      password,
    });
    console.log(user);
    return user;
  } catch (error) {
    console.log('error signing in', error);
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}
