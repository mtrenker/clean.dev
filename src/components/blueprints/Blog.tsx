import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import { Post } from '../Blog/Post';
import { Overview } from '../Blog/Overview';

export const Blog: FC = () => (
  <Switch>
    <Route exact path="/blog">
      <Overview />
    </Route>
    <Route exact path="/blog/:title">
      <Post />
    </Route>
  </Switch>
);
