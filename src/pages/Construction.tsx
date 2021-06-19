import { useContext, VFC } from 'react';
import { css } from '@emotion/react';

import { SignIn } from '../components/SignIn';
import { UserContext } from '../context/UserContext';

const constructionCss = css`
  height: 100vh;
  width: 100vw;
  display: grid;
  align-items: center;

  background-color: #212529;
  color: #f8f9fa;

  > div {
    margin: 0 auto;
    padding: 16px;
    width: 400px;
    background-color: #343a40;
    border-radius: 4px;
  }
`;

export const Construction: VFC = () => {
  const user = useContext(UserContext);
  return (
    <main css={constructionCss}>
      <div>
        <h1>clean.dev</h1>
        <h2>under construction</h2>
        <section>
          {!user && (
            <SignIn />
          )}
          {user && (
            <p>{`Willkommen, ${user.attributes.email}`}</p>
          )}
        </section>
      </div>
    </main>
  );
};
