import { Auth, CognitoUser } from '@aws-amplify/auth';

export const configure = (): void => {
  Auth.configure({
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
    mandatorySignIn: false,
  });
};

export interface User {
  username: string;
  jwtToken: string;
}

export async function signIn(username: string, password: string): Promise<User | null> {
  try {
    const cognitoUser: CognitoUser = await Auth.signIn({
      username,
      password,
    });
    const session = await Auth.currentSession();

    const user: User = {
      username: cognitoUser.getUsername(),
      jwtToken: session.getAccessToken().getJwtToken(),
    };

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

export async function getJwtToken(): Promise<string | null> {
  try {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  Auth.signOut();
}
