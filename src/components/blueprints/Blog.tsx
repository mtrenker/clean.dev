import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import { Post } from '../blog/Post';
import { Overview } from '../blog/Overview';

export const Blog: FC = () => (
  <Switch>
    <Route exact path="/blog">
      <Overview />
    </Route>
    <Route exact path="/blog/:slug">
      <Post />
    </Route>
  </Switch>
);
