import type { AppProps } from 'next/app';
import { Auth } from '@aws-amplify/auth';
import { ApolloProvider } from '@apollo/client';

import { Layout } from '../common/components/Layout';
import { Authenticator } from '../features/users/components/Authenticator';
import { client } from '../graphql/client';

import '../styles/globals.css';

const awsConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
};

Auth.configure(awsConfig);

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Authenticator>
      <ApolloProvider client={client} >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </Authenticator>
  );
};

export default MyApp;
