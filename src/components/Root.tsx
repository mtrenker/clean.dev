import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';

import { Page } from '../pages/Page';
import { client } from '../graphql/client';
import { UserContext, UserContextProps } from '../context/UserContext';
import { getUser, User } from '../lib/auth';

export const Root: FC = () => {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    fetchUser();
  }, [user]);

  const userContext: UserContextProps = {
    setUser,
    user,
  };
  return (
    <ApolloProvider client={client}>
      <UserContext.Provider value={userContext}>
        <Router>
          <Switch>
            <Route path="/">
              <Page />
            </Route>
          </Switch>
        </Router>
      </UserContext.Provider>
    </ApolloProvider>
  );
};
