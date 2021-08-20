import { VFC } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Post } from './Post';
import { Posts } from './Posts';

export const Overview: VFC = () => (
  <Switch>
    <Route exact path="/posts/:slug">
      <Post />
    </Route>
    <Route path="/posts">
      <Posts />
      <Link to="/posts/example">Example</Link>
    </Route>
  </Switch>
);
