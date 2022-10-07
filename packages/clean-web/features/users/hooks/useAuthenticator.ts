import { useContext } from 'react';
import { AuthenticatorContext } from '../components/Authenticator';

export const useAuthenticator = () => {
  const { setUser, user } = useContext(AuthenticatorContext);
  return { user, setUser };
};
