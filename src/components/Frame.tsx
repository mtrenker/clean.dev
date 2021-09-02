import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { css } from '@emotion/react';

const frameCss = css`
  > header {
    z-index: 10;
    display: flex;
    align-items: center;
    height: 75px;
    top: 0;
    nav {
      flex: 1;
      ul {
        display: flex;
        justify-content: space-between;
        height: 50px;
        align-items: center;
        margin: 0 16px;
        li {
          flex: 1;
          text-align: right;
          &:first-of-type {
            text-align: left;
            flex: 2;
            font-weight: 600;
          }
        }
        a {
          text-decoration: none;
          color: #ffffff;
          &:after {
            content: " ";
            border-top: 1px solid red;
            width: 20px;
            height: 1px;
          }
        }
      }
    }
  }
  .container {
    padding: 0 24px;
    @media(min-width: 768px) {
      max-width: 1633px;
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
      <nav className="container">
        <ul>
          <li>
            <NavLink to="/">clean.dev</NavLink>
          </li>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/posts">Posts</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
        </ul>
      </nav>
    </header>
    {children}
    <footer>
      Footer
    </footer>
  </div>
);
