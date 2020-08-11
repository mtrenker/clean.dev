import React, { FC } from 'react';
import { css } from '@emotion/core';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Link } from 'react-router-dom';

import { useGetBlogListQuery } from '../../graphql/hooks';
import { mapWidgets } from '../../lib/contentful';
import { Card } from '../layout/Card';
import { HeroImage } from '../HeroImage';

const overviewCss = css`
  padding-top: 25px;
  display: flex;
  flex-flow: wrap;
  gap: 16px;
`;

const cardCss = css`
  flex: 1;
  min-width: 450px;

  .image {
    height: 150px;
    overflow: hidden;
    img {
      margin-top: -75px;
    }
  }
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
          <Card key={post.id} css={cardCss}>
            <div className="image">
              <HeroImage url={post.heroImage?.url} />
            </div>
            <Link to={`/blog/${post.slug}`}>
              <h2>{post.title}</h2>
              {intro}
            </Link>
          </Card>
        );
      })}
    </div>
  );
};
