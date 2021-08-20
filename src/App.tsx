import {
  FC, StrictMode, useEffect, useState,
} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

import { ApolloProvider } from '@apollo/client';
import { Construction } from './pages/Construction';
import { GlobalStyle } from './components/GlobalStyle';

import { getCurrentUser } from './lib/auth';
import { UserContext } from './context/UserContext';
import { Home } from './pages/Home';
import { Projects } from './pages/projects/Overview';
import { client } from './lib/graphql';
import { Timesheet } from './pages/projects/Timesheet';
import { Tracking } from './pages/projects/Tracking';
import { Overview } from './pages/blog/Overview';
import { Frame } from './components/Frame';

export const App: FC = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    getUser();
  }, []);

  return (
    <StrictMode>
      <ApolloProvider client={client}>
        <ThemeProvider theme={{}}>
          <GlobalStyle />
          <link rel="stylesheet" href="https://use.typekit.net/ure2jht.css" />
          <UserContext.Provider value={user}>
            {!user && (
            <Router>
              <Switch>
                <Route path="/">
                  <Construction />
                </Route>
              </Switch>
            </Router>
            )}
            {user && (
            <Router>
              <Frame>
                <Switch>
                  <Route exact path="/projects/:projectId/timesheet">
                    <Timesheet />
                  </Route>
                  <Route exact path="/projects/:projectId/tracking">
                    <Tracking />
                  </Route>
                  <Route exact path="/projects">
                    <Projects />
                  </Route>
                  <Route path="/posts">
                    <Overview />
                  </Route>
                  <Route path="/">
                    <Home />
                  </Route>
                </Switch>
              </Frame>
            </Router>
            )}
          </UserContext.Provider>
        </ThemeProvider>
      </ApolloProvider>
    </StrictMode>
  );
};
