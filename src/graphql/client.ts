import ApolloClient from 'apollo-boost';
import { User } from '../lib/auth';

interface ClientOptions {
  user: User | null;
}

export const client = (options: ClientOptions): ApolloClient<undefined> => {
  const { user } = options;
  const headers: { 'x-api-key'?: string; authorization?: string } = {

  };

  if (user) {
    headers.authorization = user.jwtToken;
  } else {
    headers['x-api-key'] = process.env.GRAPHQL_API_TOKEN;
  }

  return new ApolloClient({
    uri: process.env.GRAPHQL_ENDPOINT,
    headers,
  });
};
