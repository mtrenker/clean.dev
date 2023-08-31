import { GetPostsQuery } from '@/lib/blog/generated';

const API_TOKEN = process.env.API_TOKEN as string;
const CONTENT_API_URL = process.env.CONTENT_API_URL as string;

export interface BlogOptions {
  draft?: boolean;
}

export const getPosts = async (options?: BlogOptions) => {
  const { draft } = options || {};
  const response = await fetch(CONTENT_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query {
          posts {
            id
            slug
            title
          }
        }
      `,
    }),
    headers: {
      'Content-Type': 'application/json',
      'gcms-stage': draft ? 'DRAFT' : 'PUBLISHED',
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
  const { data, errors } = await response.json();
  return data as GetPostsQuery;
}
