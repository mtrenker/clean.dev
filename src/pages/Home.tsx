import { VFC } from 'react';
import { css } from '@emotion/react';

import { Hero } from '../components/sections/Hero';

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

export const Home: VFC = () => (
  <div css={homeCss}>
    <Hero />
  </div>
);
