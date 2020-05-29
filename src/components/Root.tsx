import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider } from 'emotion-theming';

import { Page } from '../pages/Page';
import { client } from '../graphql/client';
import { getUser, User, configure } from '../lib/auth';
import { UserContext } from '../context/UserContext';
import { GlobalStyle } from './layout/GlobalStyle';
import { theme } from '../themes/default';
import { Track } from '../pages/Track';
import { TimeSheet } from '../pages/TimeSheet';


export const Root: FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    configure();
    const fetchUser = async (): Promise<void> => {
      const fetchedUser = await getUser();
      setUser(fetchedUser);
    };

    if (!user?.username) {
      fetchUser();
    }
  }, [user?.username]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ApolloProvider client={client({ user })}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Router>
            <Switch>
              <Route path="/track" exact>
                <Track />
              </Route>
              <Route path="/timesheet">
                <TimeSheet />
              </Route>
              <Route path="/">
                <Page />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </UserContext.Provider>
  );
};
