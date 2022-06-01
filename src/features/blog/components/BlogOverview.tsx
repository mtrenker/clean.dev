import { Container } from '@mui/material';
import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

export const BlogOverview: FC = () => (
  <Container>
    <Helmet>
      <title>blog - clean.dev</title>
    </Helmet>
  </Container>
);
