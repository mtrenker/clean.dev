/* eslint-disable @typescript-eslint/camelcase */
import API from 'aws-amplify';

export interface User {
  firstName: string;
  lastName: string;
}

API.configure({
  aws_cognito_region: process.env.AWS_REGION,
  aws_user_pools_id: process.env.COGNITO_POOL_ID,
  aws_user_pools_web_client_id: process.env.COGNITO_CLIENT_ID,
});

export async function signIn(username: string, password: string): Promise<void> {
  try {
    const user = await API.Auth.signIn({
      username,
      password,
    });
    console.log(user);
  } catch (error) {
    console.log('error signing in', error);
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const user = await API.Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    console.log('catch');
    return null;
  } finally {
    console.log('finally');
  }
}
