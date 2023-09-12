import gql from 'gql-tag';
import { getSecret } from '../secrets';
import type { GetPostQuery, GetPostsQuery } from './generated';

const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT ?? '';

export interface QueryOptions {
  draft?: boolean;
  variables?: Record<string, string>;
}

const query = async <T extends object>(document: ReturnType<typeof gql>, options?: QueryOptions) => {
  const { draft, variables } = options || {};

  const BLOG_TOKEN = await getSecret('clean/blog/api-secret', 'BLOG_TOKEN');

  const response = await fetch(BLOG_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: document,
      variables,
    }),
    headers: {
      'Content-Type': 'application/json',
      'gcms-stage': draft ? 'DRAFT' : 'PUBLISHED',
      Authorization: `Bearer ${BLOG_TOKEN}`,
    },
  });

  const { data, error } = await response.json() as { data: T };

  return data;
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
        image {
          url(transformation: {image: {resize: {width: 1200}}})
        }
        author {
          name
          intro
          avatar {
            url(transformation: {image: {resize: {width: 80}}})
          }
        }
        teaser {
          text
          raw
        }
        content {
          references {
            ... on CodeExample {
              id
              name
              description
              language
              code
              owner
              repo
              expression
            }
          }
          raw
        }
      }
    }
  `;
  const { post } = await query<GetPostQuery>(getPostQuery, { variables: { slug }, ...options });
  return post;
}
