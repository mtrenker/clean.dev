import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useBlogQuery } from '../graphql/hooks';
import { Header } from '../components/Header';
import { Container } from '../components/Container';
import { Footer } from '../components/Footer';
import { mapWidgets } from '../lib/contentful';

export const Blog: FC = () => {
  const { title } = useParams();

  const { data } = useBlogQuery({ variables: { input: { post: title } } });
  if (!data) return <p>Loading</p>;
  const document = data?.blog?.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });
  return (
    <>
      <Header />
      <Container>
        <h1>BLOG</h1>
        {content}
      </Container>
      <Footer />
    </>
  );
};
