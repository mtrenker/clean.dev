import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  generates: {
    './graphql/generated.tsx': {
      schema: './graphql/*.graphql',
      documents: ['./graphql/docs/api/**/*.graphql'],
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
    './graphql/hygraph.ts': {
      schema: 'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clav7ijug2n3n01t482yqa53o/master',
      documents: ['./graphql/docs/hygraph/**/*.graphql'],
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
