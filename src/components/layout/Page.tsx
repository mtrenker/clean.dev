import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { ThemeProvider } from 'emotion-theming';

import { useGetPageQuery } from '../../graphql/hooks';
import { Header } from './Header';
import { Container } from './Container';
import { Footer } from './Footer';
import { mapWidgets } from '../../lib/contentful';
import { ErrorBoundary } from './ErrorBoundary';
import { theme } from '../../themes/default';

export const Page: FC = () => {
  const { pathname } = useLocation();
  const page = pathname.split('/')[1];
  const { data, error } = useGetPageQuery({ variables: { pageQuery: { slug: page } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Container>
        {error && <p>{error.message}</p>}
        <ErrorBoundary>
          {content}
        </ErrorBoundary>
      </Container>
      <Footer />
    </ThemeProvider>
  );
};
