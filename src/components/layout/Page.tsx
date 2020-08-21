import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../../graphql/hooks';
import { Header } from './Header';
import { Footer } from './Footer';
import { mapWidgets } from '../../lib/contentful';
import { ErrorBoundary } from './ErrorBoundary';

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
    <>
      <Header />
      {error && <p>{error.message}</p>}
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
      <Footer />
    </>
  );
};
