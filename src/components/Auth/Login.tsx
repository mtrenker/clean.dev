import React, { FC, useContext, useRef } from 'react';

import { signIn, signOut } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const login = async (): Promise<void> => {
    const loggedInUser = await signIn(
      usernameRef.current?.value ?? '',
      passwordRef.current?.value ?? '',
    );
    setUser(loggedInUser);
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
  };


  if (user) {
    return (
      <p>
        {user.username}
        <button type="submit" onClick={logout}>Logout</button>
      </p>
    );
  }
  return (
    <div>
      <input type="text" ref={usernameRef} />
      <input type="password" ref={passwordRef} />
      <button type="submit" onClick={login}>Login</button>
    </div>
  );
};
