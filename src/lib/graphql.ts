import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import Auth from '@aws-amplify/auth';

const authLink = setContext(() => new Promise((resolve) => {
  Auth.currentSession().then((session) => {
    if (session) {
      resolve({
        headers: {
          authorization: session.getAccessToken().getJwtToken(),
        },
      });
    } else {
      resolve({
        headers: {
          'x-api-key': process.env.GRAPHQL_API_TOKEN,
        },
      });
    }
  });
}));

const link = ApolloLink.from([
  authLink,
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ));
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  new HttpLink({
    uri: process.env.GRAPHQL_ENDPOINT ?? '',
    credentials: 'same-origin',
  }),
]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
