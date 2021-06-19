import { VFC } from 'react';
import { css, Global } from '@emotion/react';

const globalCss = css`
  html {
    box-sizing: border-box;
    font-size: 16px;
    font-family: zeitung-micro, sans-serif;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body, h1, h2, h3, h4, h5, h6, p, ol, ul {
    margin: 0;
    padding: 0;
    font-weight: normal;
  }

  ol, ul {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

export const GlobalStyle: VFC = () => (
  <Global styles={globalCss} />
);
