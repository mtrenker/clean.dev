import { VFC } from 'react';
import { css, Global } from '@emotion/react';
import { darkCssVariables, globalCssVariables, lightCssVariables } from '../lib/colors';

const globalCss = css`

  :root {
    ${globalCssVariables};
    ${lightCssVariables};
    ${darkCssVariables};

    /* light by default */
    --brand: var(--brand-light);

    --text1: var(--text1-light);
    --text2: var(--text2-light);

    --surface1: var(--surface1-light);
    --surface2: var(--surface2-light);
    --surface3: var(--surface3-light);
    --surface4: var(--surface4-light);

    --surface-shadow: var(--surface-shadow-light);
    --shadow-strength: var(--surface-strength-light);

    --border: var(--border-light);
    --box-shadow: var(--box-shadow-light);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --brand: var(--brand-dark);

      --text1: var(--text1-dark);
      --text2: var(--text2-dark);

      --surface1: var(--surface1-dark);
      --surface2: var(--surface2-dark);
      --surface3: var(--surface3-dark);
      --surface4: var(--surface4-dark);

      --surface-shadow: var(--surface-shadow-dark);
      --shadow-strength: var(--surface-strength-dark);

      --border: var(--border-dark);
      --box-shadow: var(--box-shadow-dark);
    }
  }

  html {
    box-sizing: border-box;
    font-size: 16px;
    font-family: zeitung-micro, sans-serif;
    background-color: var(--surface1);
    color: var(--text1);
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
