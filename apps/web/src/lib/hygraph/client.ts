import gql from 'gql-tag';
import { draftMode } from 'next/headers';
import { getSecret } from '../secrets';
import type { GetPostQuery, GetPostsQuery, GetProjectsQuery, GetTechnologiesQuery } from './generated';

const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT ?? '';

export interface QueryOptions {
  variables?: Record<string, string>;
}

const query = async <T extends object>(document: ReturnType<typeof gql>, options?: QueryOptions) => {
  const { variables } = options || {};
  const draft = draftMode().isEnabled;

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

  const { data } = await response.json() as { data: T };

  return data;
}

export const getPosts = async (options?: QueryOptions) => {
  const getPostsQuery = gql`
    query GetPosts {
      posts {
        tagline
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
        tagline
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
            ... on Post {
              id
              slug
            }
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

export const getProjects = async () => {
  const getProjectsQuery = gql`
    query GetProjects {
      projects(first: 100) {
        id
        title
        role
        startDate
        endDate
        overview {
          raw
        }
        client {
          name
        }
        featured
        processes {
          name
        }
        technologies {
          name
          iconName
        }
        details {
          raw
        }
      }
    }
  `;
  const { projects } = await query<GetProjectsQuery>(getProjectsQuery);
  return projects;
}

export const getTechnologies = async () => {
  const getTechnologiesQuery = gql`
    query GetTechnologies {
      technologies(first: 100) {
        id
        name
        iconName
        proficiency
      }
    }
  `;
  const { technologies } = await query<GetTechnologiesQuery>(getTechnologiesQuery);
  return technologies;
}
