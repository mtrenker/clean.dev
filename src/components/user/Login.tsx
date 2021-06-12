import React, {
  FC, useRef, useContext, useState,
} from 'react';
import { css } from '@emotion/react';
import { useHistory } from 'react-router-dom';

import { signIn, signOut, getCleanUser } from '../../lib/auth';
import { UserContext } from '../../context/UserContext';

const loggedInCss = css`
  display: flex;
  justify-content: center;
  svg {
    margin-left: 4px;
    cursor: pointer;
  }
`;

const loggedOutCss = css`
  svg {
    margin-left: 4px;
    cursor: pointer;
  }
  .login.closed {
    display: none;
  }
  .login.open {
    padding: 4px;
    position: absolute;
    background-color: #FFF;
    border: 1px solid black;
    display: grid;
    grid-template:
      "username" auto
      "password" auto
      "submit" auto
      / 1fr;
    gap: 4px;
    input, button {
      border: 1px solid #000;
    }
  }
`;

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();
  const [showLogin, setShowLogin] = useState<boolean>(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  const login = async (): Promise<void> => {
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
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
  };

  if (user) {
    return (
      <span css={loggedInCss}>
        {`Hi, ${user.username}`}
        <Icon icon="sign-out" onClick={() => logout()} />
      </span>
    );
  }
  return (
    <div css={loggedOutCss}>
      <div className={`login ${showLogin ? 'open' : 'closed'}`}>
        <input type="text" ref={usernameRef} />
        <input type="password" ref={passwordRef} />
        <button type="submit" onClick={login}>Login</button>
      </div>
    </div>
  );
};
