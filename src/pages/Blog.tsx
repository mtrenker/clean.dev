import React, { FC } from 'react';
import Helmet from 'react-helmet';

import { Header } from '../components/layout/Header';
import { Grid } from '../components/layout/Grid';

export const Blog: FC = () => (
  <Grid>
    <Header>
      <Helmet>
        <title>Blog</title>
      </Helmet>
    </Header>
    <main>
      <h2>Blog</h2>
      <ul>
        <li>Blub</li>
        <li>Bla</li>
      </ul>
    </main>
    <footer>
      Footer
    </footer>
  </Grid>
);
