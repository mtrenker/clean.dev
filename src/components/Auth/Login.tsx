import React, { FC, useContext } from 'react';

import { signIn, signOut } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);

  const login = async (): Promise<void> => {
    const loggedInUser = await signIn('username', 'password');
    setUser(loggedInUser);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };


  if (user) {
    return (
      <p>
        {user.username}
        <button type="submit" onClick={() => logout()}>Logout</button>
      </p>
    );
  }
  return (
    <div>
      <input type="text" />
      <input type="password" />
      <button type="submit" onClick={() => login()}>Login</button>
    </div>
  );
};
