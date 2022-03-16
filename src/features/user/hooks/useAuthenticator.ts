import { Auth, CognitoUser } from '@aws-amplify/auth';
import { useEffect, useState } from 'react';

export const useAuthenticator = () => {
  const [user, setUser] = useState<CognitoUser>();
  const signIn = async (username: string, password: string) => {
    const cognitoUser = await Auth.signIn(username, password);
    if (cognitoUser) {
      setUser(cognitoUser);
    }
  };
  const signOut = () => {
    Auth.signOut();
    setUser(undefined);
  };
  useEffect(() => {
    const getUser = async () => {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        setUser(cognitoUser);
      } catch (error) {
        console.log('catched: ', error);
      }
    };
    getUser();
  }, []);
  return {
    user,
    signIn,
    signOut,
  };
};
