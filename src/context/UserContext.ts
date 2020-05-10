import React, { Dispatch, SetStateAction } from 'react';

import { User } from '../lib/auth';

export interface UserContextProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const UserContext = React.createContext<UserContextProps>({
  user: null,
  setUser: () => null,
});
