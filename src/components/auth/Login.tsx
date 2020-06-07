import React, { FC, useRef, useContext } from 'react';
import { css } from '@emotion/core';
import { useHistory } from 'react-router-dom';

import { signIn, signOut, getCleanUser } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';

const input = css`
  border: 1px solid #CCC;
  margin-left: 8px;
`;

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const login = async (): Promise<void> => {
    const authenticatedUser = await signIn(
      usernameRef.current?.value ?? '',
      passwordRef.current?.value ?? '',
    );
    if (authenticatedUser) {
      switch (authenticatedUser.challengeName) {
        case 'NEW_PASSWORD_REQUIRED':
          history.push('/change-password');
          break;
        default:
          setUser(getCleanUser(authenticatedUser));
      }
    }
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
  };


  if (user) {
    return (
      <p>
        <span>{`Hi, ${user.username}`}</span>
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
