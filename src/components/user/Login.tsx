import React, {
  FC, useRef, useContext, useState,
} from 'react';
import { css } from '@emotion/core';
import { useHistory } from 'react-router-dom';

import { signIn, signOut, getCleanUser } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';
import { LoadingSpinner } from '../LoadingSpinner';

const inputCss = css`
  border: 1px solid #CCC;
  margin-left: 8px;
  width: 10rem;
`;

const buttonCss = css`
  border: 1px solid #CCC;
`;

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const login = async (): Promise<void> => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
  };

  if (user) {
    return (
      <p>
        <span>{`Hi, ${user.username}`}</span>
        <button css={buttonCss} type="submit" onClick={logout}>Logout</button>
      </p>
    );
  }
  return (
    <div css={{ position: 'relative' }}>
      { loading && <LoadingSpinner />}
      <input disabled={loading} css={inputCss} type="text" ref={usernameRef} />
      <input disabled={loading} css={inputCss} type="password" ref={passwordRef} />
      <button disabled={loading} css={buttonCss} type="submit" onClick={login}>Login</button>
    </div>
  );
};
