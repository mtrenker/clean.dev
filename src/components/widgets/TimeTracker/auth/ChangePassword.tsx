import React, { FC, useRef } from 'react';
import { changePassword } from '../../../../lib/auth';

export const ChangePassword: FC = () => {
  const oldPasswordInput = useRef<HTMLInputElement>(null);
  const newPasswordInput = useRef<HTMLInputElement>(null);

  const onChangePasswordClick = () => {
    changePassword(oldPasswordInput.current.value, newPasswordInput.current.value);
  };
  return (
    <div>
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
