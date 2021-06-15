import React, {
  FC, useState, useEffect, StrictMode,
} from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';

import { Page } from './components/layout/Page';
import { GlobalStyle } from './components/layout/GlobalStyle';
import { client } from './lib/graphql';
import { UserContext } from './context/UserContext';
import { CleanUser, getUser, getCleanUser } from './lib/auth';

const container = document.createElement('div');

export const App: FC = () => {
  const [user, setUser] = useState<CleanUser|null>(null);

  const refreshUser = async () => {
    const authenticatedUser = await getUser();
    if (authenticatedUser) {
      setUser(getCleanUser(authenticatedUser));
    }
  };

  useEffect(() => {
    refreshUser();
  }, [user?.username]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      <ApolloProvider client={client}>
        <StrictMode>
          <ThemeProvider theme={{}}>
            <link rel="stylesheet" href="https://use.typekit.net/ure2jht.css" />
            <GlobalStyle />
            <Router>
              <Switch>
                <Route path="/">
                  <Page />
                </Route>
              </Switch>
            </Router>
          </ThemeProvider>
        </StrictMode>
      </ApolloProvider>
    </UserContext.Provider>
  );
};

render(<App />, document.body.appendChild(container));
