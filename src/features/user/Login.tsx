/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Container } from '@mui/material';
import { TextField } from '../../common/components/TextField';
import { Button } from '../../common/components/Button';
import { useAuthenticator } from './hooks/useAuthenticator';

interface LoginData {
  username: string;
  password: string;
}

export const Login: React.VFC = () => {
  const { handleSubmit, register } = useForm<LoginData>();
  const { signIn } = useAuthenticator();
  const onSubmit = async ({ password, username }: LoginData) => {
    await signIn(username, password);
  };
  return (
    <Container>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          label="Username"
          {...register('username')}
        />
        <TextField
          label="Password"
          type="password"
          {...register('password')}
        />
        <Button type="submit">Login</Button>
      </Box>
    </Container>
  );
};
