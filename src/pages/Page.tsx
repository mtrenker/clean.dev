import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../graphql/hooks';
import { Header } from '../components/layout/Header';
import { Container } from '../components/layout/Container';
import { Footer } from '../components/layout/Footer';
import { mapWidgets } from '../lib/contentful';

export const Page: FC = () => {
  const { pathname } = useLocation();
  const { data, error } = useGetPageQuery({ variables: { input: { slug: pathname } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content;

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });
  return (
    <>
      <Header />
      <Container>
        {error && <p>{error.message}</p>}
        {content}
      </Container>
      <Footer />
    </>
  );
};
