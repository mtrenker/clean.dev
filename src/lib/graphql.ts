import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Auth from '@aws-amplify/auth';

const authLink = setContext(() => new Promise((resolve) => {
  Auth.currentSession().then((session) => {
    resolve({
      headers: {
        authorization: session.getAccessToken().getJwtToken(),
      },
    });
  }).catch(() => {
    resolve({
      headers: {
        'x-api-key': process.env.GRAPHQL_API_TOKEN,
      },
    });
  });
}));

const link = from([
  authLink,
  new HttpLink({
    uri: process.env.GRAPHQL_ENDPOINT ?? '',
    credentials: 'same-origin',
    // fetch: signedFetch,
  }),
]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
