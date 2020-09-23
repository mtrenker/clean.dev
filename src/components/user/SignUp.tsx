import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { signUp } from '../../lib/auth';

interface SignUpData {
  username: string;
  password: string;
}

export const SignUp: FC = () => {
  const { handleSubmit, register } = useForm<SignUpData>();

  const onSubmit = async ({ password, username }: SignUpData) => {
    await signUp(username, password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" ref={register} name="username" />
      <input type="text" ref={register} name="password" />
      <button type="submit">Submit</button>
    </form>
  );
};
