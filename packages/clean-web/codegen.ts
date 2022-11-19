import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    './graphql/schema.graphql',
    'https://api-eu-central-1-shared-euc1-02.hygraph.com/v2/clantqa0u441201tahy2j663l/master',
  ],
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
