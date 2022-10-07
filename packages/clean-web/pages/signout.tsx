import { Auth } from '@aws-amplify/auth';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useAuthenticator } from '../features/users/hooks/useAuthenticator';

const SignIn: NextPage = () => {
  const { setUser } = useAuthenticator();
  useEffect(() => {
    const signOut = async () => {
      await Auth.signOut();
      setUser(null);
    };
    signOut();
  }, [setUser]);


  return (
    <div>
      Signed Out
    </div>
  );
};

export default SignIn;
