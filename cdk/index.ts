import { App } from '@aws-cdk/core';

import { AuthStack } from './stacks/AuthStack';
import { ApiStack } from './stacks/ApiStack';
import { BIStack } from './stacks/BIStack';
import { CertStack } from './stacks/CertStack';
import { FrontStack } from './stacks/FrontStack';
import { CmsStack } from './stacks/CmsStack';

const app = new App();

const defaultProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new CertStack(app, 'CleanCert', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});

new BIStack(app, 'CleanBI', defaultProps);

new AuthStack(app, 'CleanAuth', defaultProps);

new ApiStack(app, 'CleanApi', defaultProps);

new FrontStack(app, 'CleanFront', defaultProps);

new CmsStack(app, 'CleanCMS', defaultProps);

app.synth();
