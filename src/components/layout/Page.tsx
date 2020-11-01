import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetPageQuery } from '../../graphql/hooks';
import { Header } from './Header';
import { Footer } from './Footer';
import { mapWidgets } from '../../lib/contentful';
import { ErrorBoundary } from './ErrorBoundary';
import { useTheme } from '../../lib/style';

export const Page: FC = () => {
  const { css: { containerCss } } = useTheme();
  const { pathname } = useLocation();
  const page = pathname.split('/')[1];
  const { data, error } = useGetPageQuery({ variables: { slug: `/${page}` } });
  if (!data) return <p>Loading</p>;
  const document = data?.getPage?.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });

  const renderContent = () => {
    if (data.getPage?.layout === 'container') {
      return <div css={containerCss}>{content}</div>;
    }
    return content;
  };
  return (
    <>
      <Header />
      {error && <p>{error.message}</p>}
      <ErrorBoundary>
        {renderContent()}
      </ErrorBoundary>
      <Footer />
    </>
  );
};
