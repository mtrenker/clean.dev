import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
  uri: process.env.GRAPHQL_ENDPOINT,
  headers: {
    'x-api-key': process.env.GRAPHQL_API_TOKEN,
  },
});
