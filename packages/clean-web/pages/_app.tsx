import type { AppProps } from 'next/app';
import { Auth } from '@aws-amplify/auth';

import { Layout } from '../common/components/Layout';
import '../styles/globals.css';
import { Authenticator } from '../common/components/Authenticator';

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
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Authenticator>
  );
};

export default MyApp;
