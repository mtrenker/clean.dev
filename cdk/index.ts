import { App } from '@aws-cdk/core';

import { AuthStack } from './stacks/AuthStack';
import { ApiStack } from './stacks/ApiStack';
import { BIStack } from './stacks/BIStack';
import { FrontStack } from './stacks/FrontStack';
import { CmsStack } from './stacks/CmsStack';
import { CertStack } from './stacks/CertStack';

const app = new App();

const defaultProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new CertStack(app, 'Cert', defaultProps);

new AuthStack(app, 'Auth', defaultProps);

new BIStack(app, 'Bi', defaultProps);

new ApiStack(app, 'Api', defaultProps);

new FrontStack(app, 'Frontend', defaultProps);

new CmsStack(app, 'Cms', defaultProps);

app.synth();
