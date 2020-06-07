import React, { FC, useRef, useContext } from 'react';
import { UserContext } from '../../../context/UserContext';
import { changePassword } from '../../../lib/auth';

export const ChangePassword: FC = () => {
  const { refreshUser } = useContext(UserContext);
  const usernameInput = useRef<HTMLInputElement>(null);
  const oldPasswordInput = useRef<HTMLInputElement>(null);
  const newPasswordInput = useRef<HTMLInputElement>(null);

  const onChangePasswordClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await changePassword(
      usernameInput.current.value,
      oldPasswordInput.current.value,
      newPasswordInput.current.value,
    );
    refreshUser();
  };

  return (
    <div>
      Username:
      <input type="text" ref={usernameInput} />
      Old Password:
      <input type="password" ref={oldPasswordInput} />
      <br />
      New Password:
      <input type="password" ref={newPasswordInput} />
      <br />
      <button type="button" onClick={onChangePasswordClick}>Change Password</button>
    </div>
  );
};
