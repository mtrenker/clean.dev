import { Auth, CognitoUser } from '@aws-amplify/auth';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/components/Button';
import { useAuthenticator } from '../common/hooks/useAuthenticator';

type SignInModes = 'signin' | 'changepw' | 'success';

interface SignInData {
  username: string;
  password: string;
  newPassword?: string;
}

const SignIn: NextPage = () => {
  const [mode, setMode] = useState<SignInModes>('signin');
  const { setUser } = useAuthenticator();
  const { register, handleSubmit } = useForm<SignInData>();

  const router = useRouter();

  const onSubmit = async ({ username, password, newPassword }: SignInData) => {
    switch (mode) {
      case 'signin': {
        const result = await Auth.signIn(username, password) as CognitoUser;
        if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
          setMode('changepw');
        } else {
          setUser(result);
          router.push('/');
        }
        break;
      }
      case 'changepw': {
        if(!newPassword) {
          throw new Error('new password is required');
        }
        const user = await Auth.signIn(username, password) as CognitoUser;
        await Auth.completeNewPassword(user, newPassword);
        setMode('success');
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="m-4 mx-auto w-full max-w-xl rounded bg-slate-200 p-4 text-black shadow">
      {mode === 'changepw' && (
        <p className="p-4 text-center text-teal-900">Your password needs to be changed</p>
      )}
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="sr-only" htmlFor="username">Username</label>
          <input
            className="text-black"
            id="username"
            placeholder="Username"
            type="text"
            {...register('username')}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="password">Password</label>
          <input
            className="text-black"
            id="password"
            placeholder="Password"
            type="password"
            {...register('password')}
          />
        </div>
        {mode === 'changepw' && (
          <div>
            <label className="sr-only" htmlFor="newPassword">New Password</label>
            <input
              className="text-black"
              id="newPassword"
              placeholder="New Password"
              type="password"
              {...register('newPassword')}
            />
          </div>
        )}
        <div>
          <Button type="submit">
            {mode === 'signin' ? 'Sign In' : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
