import React, { FC, useContext, useRef } from 'react';
import { css } from '@emotion/core';

import { signIn, signOut } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';

const input = css`
  border: 1px solid #CCC;
  margin-left: 8px;
`;

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
        <button css={input} type="submit" onClick={logout}>Logout</button>
      </p>
    );
  }
  return (
    <div>
      <input css={input} type="text" ref={usernameRef} />
      <input css={input} type="password" ref={passwordRef} />
      <button css={input} type="submit" onClick={login}>Login</button>
    </div>
  );
};
