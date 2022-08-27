/* eslint-disable react/no-multi-comp */
import { CognitoUser } from '@aws-amplify/auth';
import { createContext, FC, useState } from 'react';

interface AuthenticatorProps {
  children: React.ReactNode;
}

interface AuthenticatorContextProps {
  user: CognitoUser | null;
  setUser: (user: CognitoUser | null) => void;
}

export const AuthenticatorContext = createContext<AuthenticatorContextProps>({
  user: null,
  setUser: () => null,
});

export const Authenticator: FC<AuthenticatorProps> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  return (
    <AuthenticatorContext.Provider value={{ setUser, user }}>
      {children}
    </AuthenticatorContext.Provider>
  );
};
