import 'dotenv/config'
import { CodegenConfig } from '@graphql-codegen/cli';


const BLOG_TOKEN = process.env.BLOG_TOKEN as string;
const BLOG_ENDPOINT = process.env.BLOG_ENDPOINT as string;
const GITHUB_CODEFETCHER_TOKEN = process.env.GITHUB_CODEFETCHER_TOKEN as string;

const disableEslint = {
  add: {
    content: '/* eslint-disable -- generated code */'
  }
};

const config: CodegenConfig = {
  generates: {
    './apps/web/src/lib/github/generated.tsx': {
      schema: [{
        'https://api.github.com/graphql': {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GITHUB_CODEFETCHER_TOKEN}`,
            'User-Agent': 'CleanDev',
          },
        }
      }],
      documents: ['./apps/web/src/lib/github/client.ts'],
      plugins: [
        disableEslint,
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
      ],
    },
    './apps/web/src/lib/blog/generated.tsx': {
      schema: [{
        [BLOG_ENDPOINT]: {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${BLOG_TOKEN}`,
          },
        }
      }],
      documents: ['./apps/web/src/lib/blog/client.ts'],
      plugins: [
        disableEslint,
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
      ],
    },
  },
};

export default config;
