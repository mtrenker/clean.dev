import React, { Dispatch, SetStateAction } from 'react';

import { User } from '../lib/auth';

export interface UserContextProps {
  user?: User;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

export const UserContext = React.createContext<UserContextProps>({
  user: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUser: () => undefined,
});
