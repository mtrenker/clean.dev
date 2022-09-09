import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './graphql/schema.graphql',
  documents: ['./graphql/docs/**/*.graphql'],
  generates: {
    './graphql/generated.tsx': {
      // preset: 'client',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
  },
  config: {
    scalars: {
      AWSDate: 'string',
      AWSDateTime: 'string',
      AWSJSON: 'string',
    },
  },
};

export default config;
