import { Auth } from '@aws-amplify/auth';
import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlRequestBaseQuery({
    url: process.env.GRAPHQL_URL,
    prepareHeaders: async (headers, { getState }) => {
      try {
        const token = await (await Auth.currentSession()).getAccessToken().getJwtToken();
        if (token) {
          headers.set('authorization', token);
        }
      } catch (error) {
        console.log(error);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
