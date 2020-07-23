import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../graphql/hooks';
import { Header } from '../components/Header';
import { Container } from '../components/Container';
import { Footer } from '../components/Footer';
import { mapWidgets } from '../lib/contentful';

export const Page: FC = () => {
  const { pathname } = useLocation();
  const page = pathname.split('/')[1];
  const { data, error } = useGetPageQuery({ variables: { input: { slug: page } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content ?? '';

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
