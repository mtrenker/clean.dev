import {
  MouseEvent, useRef, useState, VFC,
} from 'react';
import { css } from '@emotion/react';

import { changePassword, signIn } from '../lib/auth';

const signInCss = css`
  display: flex;
  fieldset {
    display: grid;
    gap: 8px;
    border: none;
    width: 100%;
    padding: 0;
    label {
      display: grid;
      input, span {
        flex: 1;
      }
    }
  }
`;

export const SignIn: VFC = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const [challange, setChallange] = useState<string>();

  const onLoginClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (usernameRef.current && passwordRef.current) {
      const result = await signIn(usernameRef.current.value, passwordRef.current.value);
      if (result.challengeName) {
        setChallange(result.challengeName);
      } else {
        setChallange(undefined);
      }
    }
  };

  const Username = () => (
    <label htmlFor="username">
      <span>Username:</span>
      <input type="text" id="username" name="username" ref={usernameRef} />
    </label>
  );

  const Password = () => (
    <label htmlFor="password">
      <span>Password:</span>
      <input type="password" id="password" name="password" ref={passwordRef} />
    </label>
  );

  const NewPassword = () => (
    <label htmlFor="newPassword">
      <span>New Password:</span>
      <input type="password" id="newPassword" name="newPassword" ref={newPasswordRef} />
    </label>
  );

  const onPasswordChange = async () => {
    await changePassword(
      usernameRef.current?.value ?? '',
      passwordRef.current?.value ?? '',
      newPasswordRef.current?.value ?? '',
    );
  };

  return (
    <div css={signInCss}>
      {!challange && (
        <fieldset>
          <Username />
          <Password />
          <button type="button" onClick={onLoginClick}>Login</button>
        </fieldset>
      )}
      {challange === 'NEW_PASSWORD_REQUIRED' && (
        <fieldset>
          <p>New Password Required</p>
          <Username />
          <Password />
          <NewPassword />
          <button type="button" onClick={onPasswordChange}>Change password</button>
        </fieldset>
      )}
    </div>
  );
};
