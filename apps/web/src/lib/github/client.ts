import gql from 'gql-tag';
import { getSecret } from '../secrets';
import type { GetFileQuery, GetFileQueryVariables } from './generated';

const query = async <T extends object, V extends object>(document: ReturnType<typeof gql>, variables?: V) => {
  const GITHUB_CODEFETCHER_TOKEN = await getSecret('clean/blog/api-secret', 'GITHUB_CODEFETCHER_TOKEN');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: document,
      variables,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_CODEFETCHER_TOKEN}`,
      'User-Agent': 'CleanDev',
    },
  });

  const { data } = await response.json() as { data: T };

  return data;
}

export const getFile = async (variables: GetFileQueryVariables) => {
  const getFileQuery = gql`
    query GetFile($owner: String!, $name: String!, $expression: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $expression) {
          __typename
          ... on Blob {
            text
            byteSize
          }
        }
      }
    }
  `;
  const data = await query<GetFileQuery, GetFileQueryVariables>(getFileQuery, variables);
  return data;
};
