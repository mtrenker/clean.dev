import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';

import { Page } from '../pages/Page';
import { client } from '../graphql/client';
import { getUser, User, configure } from '../lib/auth';
import { UserContext } from '../context/UserContext';


export const Root: FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    configure();
    const fetchUser = async (): Promise<void> => {
      const fetchedUser = await getUser();
      setUser(fetchedUser);
    };

    if (!user) {
      fetchUser();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ApolloProvider client={client({ user })}>
        <Router>
          <Switch>
            <Route path="/">
              <Page />
            </Route>
          </Switch>
        </Router>
      </ApolloProvider>
    </UserContext.Provider>
  );
};
