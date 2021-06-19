import { Auth } from '@aws-amplify/auth';

Auth.configure({
  Auth: {
    region: 'eu-central-1',
    userPoolId: process.env.COGNITO_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
  },
});

export const signIn = async (username: string, password: string): Promise<any> => {
  const response = await Auth.signIn(username, password);
  return response;
};

export const changePassword = async (username: string, oldPassword: string, newPassword: string): Promise<any> => {
  const user = await Auth.signIn(username, oldPassword);
  const result = await Auth.completeNewPassword(user, newPassword);
  return result;
};

export const getCurrentUser = async () => {
  const user = await Auth.currentAuthenticatedUser();
  return user;
};
