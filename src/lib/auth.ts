import { Auth, CognitoUser } from '@aws-amplify/auth';
import { ISignUpResult } from 'amazon-cognito-identity-js';

Auth.configure({
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_POOL_ID,
  identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
  userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
  mandatorySignIn: false,
});

type UserChallanges = 'NEW_PASSWORD_REQUIRED'

export interface AuthenticatedUser extends CognitoUser {
  challengeName?: UserChallanges,
  attributes?: {
    email: string;
  }
}

export interface CleanUser {
  username: string;
}

export async function signIn(username: string, password: string): Promise<AuthenticatedUser|null> {
  try {
    return Auth.signIn({
      username,
      password,
    });
  } catch (error) {
    return null;
  }
}

export async function signUp(username: string, password: string): Promise<ISignUpResult|undefined> {
  try {
    const user = await Auth.signUp(username, password);
    return user;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function confirmSignUp(username: string, code: string): Promise<void> {
  try {
    await Auth.confirmSignUp(username, code);
  } catch (error) {
    console.error(error);
  }
}

export async function getUser(): Promise<AuthenticatedUser|null> {
  try {
    return await Auth.currentAuthenticatedUser();
  } catch (error) {
    return null;
  }
}

export async function signOut(): Promise<void> {
  Auth.signOut();
}

export function getCleanUser(cognitoUser: AuthenticatedUser): CleanUser {
  return {
    username: cognitoUser.attributes?.email ?? '',
  };
}

export async function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const oldUser = await signIn(username, oldPassword);
    if (oldUser?.challengeName === 'NEW_PASSWORD_REQUIRED') {
      await Auth.completeNewPassword(oldUser, newPassword, {});
      return true;
    }
    await Auth.changePassword(oldUser, oldPassword, newPassword);
    return true;
  } catch (error) {
    return false;
  }
}
