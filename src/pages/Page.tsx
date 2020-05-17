import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../graphql/hooks';
import { Login } from '../components/auth/Login';
import { Header } from '../components/layout/Header';
import { Heading } from '../components/typography/Heading';
import { Container } from '../components/layout/Container';
import { Footer } from '../components/layout/Footer';

export const Page: FC = () => {
  const { pathname } = useLocation();
  const { data } = useGetPageQuery({ variables: { input: { slug: pathname } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content;

  const content = documentToReactComponents(JSON.parse(document));
  return (
    <>
      <Header>
        <Heading as="h4" type="page-title">{data.page.title}</Heading>
        <Login />
      </Header>
      <Container>
        {content}
      </Container>
      <Footer />
    </>
  );
};
