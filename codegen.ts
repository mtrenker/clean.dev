import 'dotenv/config'
import { CodegenConfig } from '@graphql-codegen/cli';


const API_TOKEN = process.env.API_TOKEN as string;
const CONTENT_API_URL = process.env.CONTENT_API_URL as string;

const config: CodegenConfig = {
  schema: [{
    [CONTENT_API_URL]: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
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
