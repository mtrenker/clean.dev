import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { css } from '@emotion/react';
import { useGetBlogQuery } from '../graphql/hooks';

const frameCss = css`
  > header {
    z-index: 10;
    display: flex;
    align-items: center;
    height: 75px;
    top: 0;
    background-color: var(--surface2);
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
          color: #000000;
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
      max-width: 1200px;
      margin: 0 auto;
    }
  }
  > footer {
    background-color: var(--surface5);
    color: var(--text3);
    display: flex;
    .about {
      flex: 1 1 50%;
    }
    .navigation, .posts {
      flex: 1 1 25%;
    }
  }
  @media print {
    > header, > footer {
      display: none;
    }
  }
`;

export const Frame: FC = ({ children }) => {
  const { data } = useGetBlogQuery();
  return (
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
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <footer>
        <div className="about">
          <h3>clean.dev</h3>
          <p>
            A website dedicated to clean code, good engineering culture, product thinking, serverless
            and much more. Let me know if I can Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          </p>
        </div>
        <div className="navigation">
          <ul>
            <li>Home</li>
          </ul>
        </div>
        <div className="posts">
          <ul>
            {data?.getBlog.posts.map((post) => (
              <li key={post.slug}>{post.title}</li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
};
