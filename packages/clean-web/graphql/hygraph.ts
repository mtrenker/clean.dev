import { GraphQLClient } from 'graphql-request';

const api = process.env.NEXT_PUBLIC_HYGRAPH_API ?? '';

export const hygraph = new GraphQLClient(api);
