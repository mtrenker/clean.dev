import React, { FC } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider } from 'emotion-theming';

import { Page } from '../pages/Page';
import { GlobalStyle } from './layout/GlobalStyle';
import { theme } from '../themes/default';
import { Track } from '../pages/Track';
import { TimeSheet } from '../pages/TimeSheet';
import { client } from '../lib/graphql';


export const Root: FC = () => (
  <ApolloProvider client={client}>
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
);
