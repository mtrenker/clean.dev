import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { confirmSignUp } from '../../lib/auth';

interface ConfirmSignUpData {
  username: string;
  code: string;
}

export const ConfirmSignUp: FC = () => {
  const { handleSubmit, register } = useForm<ConfirmSignUpData>();

  const onSubmit = async ({ username, code }: ConfirmSignUpData) => {
    confirmSignUp(username, code);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" ref={register} name="username" />
      <input type="text" ref={register} name="code" />
      <button type="submit">Submit</button>
    </form>
  );
};
