/* eslint-disable react/no-multi-comp */
import { createContext, FC, useState } from 'react';

interface AuthenticatorProps {
  children: React.ReactNode;
}

interface CleanUser {
  contact: {
    company: string;
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
}

interface AuthenticatorContextProps {
  user: CleanUser | null;
  setUser: (user: CleanUser | null) => void;
}

export const AuthenticatorContext = createContext<AuthenticatorContextProps>({
  user: null,
  setUser: () => null,
});

export const Authenticator: FC<AuthenticatorProps> = ({ children }) => {
  const [user, setUser] = useState<CleanUser | null>(null);
  return (
    <AuthenticatorContext.Provider value={{ setUser, user }}>
      {children}
    </AuthenticatorContext.Provider>
  );
};
