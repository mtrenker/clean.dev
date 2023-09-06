import gql from "gql-tag";

import { GetPostQuery, GetPostsQuery } from "./generated";
import { getSecret } from "../secrets";

const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT as string;

export interface QueryOptions {
  draft?: boolean;
  variables?: any;
}

const query = async <T extends {}>(query: ReturnType<typeof gql>, options?: QueryOptions) => {
  const { draft, variables } = options || {};

  const BLOG_TOKEN = await getSecret('clean/blog/api-secret', 'BLOG_TOKEN');

  const response = await fetch(BLOG_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query,
      variables,
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
        title
        slug
        image {
          url(transformation: {
            image: {
              resize: {
                width: 800
              }
            }
          })
        }
        teaser {
          raw
        }
        createdAt
        author {
          name
          title
          avatar {
            url(transformation: {
              image: {
                resize: {
                  width: 80
                }
              }
            })
          }
        }
      }
    }
  `;
  try {
    const { posts } = await query<GetPostsQuery>(getPostsQuery, options);
    return posts;
  } catch (error) {
    return [];
  }
}

export const getPost = async (slug: string, options?: QueryOptions) => {
  const getPostQuery = gql`
    query GetPost($slug: String!) {
      post(where: { slug: $slug }) {
        title
        slug
        teaser {
          raw
        }
        content {
          raw
        }
      }
    }
  `;
  const { post } = await query<GetPostQuery>(getPostQuery, { variables: { slug }, ...options });
  return post;
}
