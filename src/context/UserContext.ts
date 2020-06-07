import React, { Dispatch, SetStateAction } from 'react';

import { CleanUser } from '../lib/auth';

export interface UserContextProps {
  user: CleanUser | null;
  setUser: Dispatch<SetStateAction<CleanUser | null>>;
  refreshUser: () => void;
}

export const UserContext = React.createContext<UserContextProps>({
  user: null,
  setUser: () => null,
  refreshUser: () => null,
});
