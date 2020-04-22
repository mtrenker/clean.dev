import React, { FC } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../graphql/hooks';

export const Frontpage: FC = () => {
  const { pathname } = useLocation();
  const { data } = useGetPageQuery({ variables: { input: { slug: pathname } } });
  if (!data) return <p>Loading</p>;
  const document = data?.page?.content as any;
  const content = documentToReactComponents(JSON.parse(document));
  return (
    <div>
      {content}
      <Link to="/blog/test-page">Test</Link>
    </div>
  );
};
