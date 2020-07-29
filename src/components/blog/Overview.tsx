import React, { FC } from 'react';
import { css } from '@emotion/core';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Link } from 'react-router-dom';

import { useGetBlogListQuery } from '../../graphql/hooks';
import { mapWidgets } from '../../lib/contentful';
import { HeroImage } from '../HeroImage';

const overviewCss = css`
  display: flex;
  gap: 16px;
`;

const cardCss = css`
  flex: 1;
  border-radius: 4px;
  border: 1px solid black;
  box-shadow: 4px 4px rgba(0, 0, 0, .6);
`;

export const Overview: FC = () => {
  const { data } = useGetBlogListQuery();
  if (!data) return <p>Loading</p>;
  return (
    <div css={overviewCss}>
      {data.blog.list.items.map((post) => {
        const intro = documentToReactComponents(JSON.parse(post.intro), {
          renderNode: mapWidgets(),
        });
        return (
          <div css={cardCss}>
            <Link to={`blog/${post.slug}`}>
              <h2>{post.title}</h2>
              <HeroImage url={post.heroImage?.url} alt={post.heroImage?.description ?? ''} />
              {intro}
            </Link>
          </div>
        );
      })}
    </div>
  );
};
