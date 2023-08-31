import gql from "gql-tag";

import { GetPostsQuery } from "./generated";

const BLOG_TOKEN = process.env.BLOG_TOKEN as string;
const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT as string;

export interface QueryOptions {
  draft?: boolean;
  variables?: any;
}

const query = async <T extends {}>(query: ReturnType<typeof gql>, options?: QueryOptions) => {
  const { draft } = options || {};
  const response = await fetch(BLOG_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query,
    }),
    headers: {
      'Content-Type': 'application/json',
      'gcms-stage': draft ? 'DRAFT' : 'PUBLISHED',
      Authorization: `Bearer ${BLOG_TOKEN}`,
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
