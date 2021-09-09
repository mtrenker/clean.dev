import { VFC } from 'react';
import { css } from '@emotion/react';

import { Hero } from '../components/sections/Hero';
import { BlogTeaser } from '../components/sections/BlogTeaser';
import { useGetBlogQuery } from '../graphql/hooks';

const homeCss = css`
  .posts {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    flex-wrap: wrap;
    article {
      text-align: center;
      flex: 1 1 300px;
      .title {
        font-size: 16px;
      }
      picture {

      }
      img {
        object-fit: cover;
        height: 300px;
        width: 300px;
      }
    }
  }
`;

export const Home: VFC = () => {
  const { data } = useGetBlogQuery();
  return (
    <div css={homeCss}>
      <Hero />
      <BlogTeaser post={data?.getBlog.posts[0]} />
    </div>
  );
};
