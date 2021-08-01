import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { css } from '@emotion/react';

const frameCss = css`
  > header {
    height: 50px;
    box-shadow:
      0 12.5px 10px rgba(0, 0, 0, 0.035),
      0 100px 80px rgba(0, 0, 0, 0.07)
    ;
    position: sticky;
    top: 0;
    background-color: #fff;
    nav {
      ul {
        display: flex;
        justify-content: space-between;
        height: 50px;
        align-items: center;
        margin: 0 16px;
        li:first-of-type {
          font-weight: 600;
        }
        a {
          text-decoration: none;
          color: #000;
        }
      }
    }
  }
  > main {
    @media(min-width: 768px) {
      max-width: 1200px;
      margin: 0 auto;
    }
  }
  @media print {
    > header, > footer {
      display: none;
    }
  }
`;

export const Frame: FC = ({ children }) => (
  <div css={frameCss}>
    <header>
      <nav>
        <ul>
          <li>
            <NavLink to="/">clean.dev</NavLink>
          </li>
          <li>
            <NavLink to="/blog">Blog</NavLink>
          </li>
          <li>
            <NavLink to="/blog/example">About</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
        </ul>
      </nav>
    </header>
    <main>{children}</main>
    <footer>
      Footer
    </footer>
  </div>
);
