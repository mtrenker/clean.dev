import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import { BlogPost } from '../BlogPost';

export const Blog: FC = () => (
  <Switch>
    <Route exact path="/blog">
      Landing Page :)
    </Route>
    <Route exact path="/blog/:title">
      <BlogPost />
    </Route>
  </Switch>
);
