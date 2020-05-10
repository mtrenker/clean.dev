import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../graphql/hooks';
import { Login } from '../components/auth/Login';

export const Page: FC = () => {
  const { pathname } = useLocation();
  const { data } = useGetPageQuery({ variables: { input: { slug: pathname } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content;

  const content = documentToReactComponents(JSON.parse(JSON.parse(document)));
  return (
    <div>
      <Login />
      {content}
    </div>
  );
};
