import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Auth } from '@aws-amplify/auth';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await Auth.currentSession().then((session) => session.getIdToken().getJwtToken());
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.log(error);
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const hygraphClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_HYGRAPH_API,
  headers: {
    authorization: process.env.NEXT_PUBLIC_HYGRAPH_API_KEY ?? '',
  },
  cache: new InMemoryCache(),
});
