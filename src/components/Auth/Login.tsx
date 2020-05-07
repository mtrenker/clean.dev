import React, { FC, useContext, useRef } from 'react';

import { UserContext } from '../../context/UserContext';
import { signIn } from '../../lib/auth';

export const Login: FC = () => {
  const { user, setUser } = useContext(UserContext);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const login = async (): Promise<void> => {
    const signedInUser = await signIn(usernameRef.current?.value ?? '', passwordRef.current?.value ?? '');
    console.log('LOGGING IN ', signedInUser);

    setUser(signedInUser!);
  };
  if (!user) {
    return (
      <div>
        <input type="text" ref={usernameRef} />
        <input type="password" ref={passwordRef} />
        <button type="submit" onClick={(): Promise<void> => login()}>login</button>
      </div>
    );
  }
  return (
    <div>
      {user
        && (
          <span>
            {`Hi ${user.username}`}
          </span>
        )}
    </div>
  );
};
