import 'dotenv/config'
import { CodegenConfig } from '@graphql-codegen/cli';


const BLOG_TOKEN = process.env.BLOG_TOKEN as string;
const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT as string;

const config: CodegenConfig = {
  schema: [{
    [BLOG_ENDPOINT]: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BLOG_TOKEN}`,
       },
    },
  }],
  documents: ['./apps/web/src/lib/blog/client.ts'],
  generates: {
    './apps/web/src/lib/blog/generated.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
      ],
    },
  },
};

export default config;
