import gql from "gql-tag";

import { GetPostsQuery } from "./generated";

const API_TOKEN = process.env.API_TOKEN as string;
const CONTENT_API_URL = process.env.CONTENT_API_URL as string;

export interface QueryOptions {
  draft?: boolean;
  variables?: any;
}

const query = async <T extends {}>(query: ReturnType<typeof gql>, options?: QueryOptions) => {
  const { draft } = options || {};
  const response = await fetch(CONTENT_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      query,
    }),
    headers: {
      'Content-Type': 'application/json',
      'gcms-stage': draft ? 'DRAFT' : 'PUBLISHED',
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
  const { data, errors } = await response.json();
  return data as T;
}

export const getPosts = async (options?: QueryOptions) => {
  const getPostsQuery = gql`
    query GetPosts {
      posts {
        id
        title
      }
    }
  `;
  const { posts } = await query<GetPostsQuery>(getPostsQuery, options);
  return posts;
}
