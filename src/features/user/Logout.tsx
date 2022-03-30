import React, { useEffect } from 'react';
import { useAuthenticator } from './hooks/useAuthenticator';

export const Logout: React.VFC = () => {
  const { signOut } = useAuthenticator();
  useEffect(() => {
    signOut();
  }, [signOut]);
  return (
    <div>Logout</div>
  );
};
