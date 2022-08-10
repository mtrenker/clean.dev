import { Auth } from '@aws-amplify/auth';
import type { NextPage } from 'next';
import { useEffect } from 'react';

const SignIn: NextPage = () => {
  useEffect(() => {
    const signOut = async () => {
      await Auth.signOut();
    };
    signOut();
  }, []);


  return (
    <div>
      Signed Out
    </div>
  );
};

export default SignIn;
