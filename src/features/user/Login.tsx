/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Container, Paper, Stack, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TextField } from '../../common/components/TextField';
import { Button } from '../../common/components/Button';
import { useAuthenticator } from './hooks/useAuthenticator';

interface LoginData {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const { handleSubmit, register } = useForm<LoginData>();
  const { signIn } = useAuthenticator();
  const navigate = useNavigate();
  const onSubmit = async ({ password, username }: LoginData) => {
    await signIn(username, password);
    navigate(-1);
  };
  return (
    <Container>
      <Paper
        elevation={2}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: 5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            '& .MuiTextField-root': {
              flex: 1,
            },
          }}
        >
          <TextField
            label="Username"
            size="small"
            {...register('username')}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            {...register('password')}
          />
        </Box>
        <Button type="submit">Login</Button>
      </Paper>
    </Container>
  );
};
