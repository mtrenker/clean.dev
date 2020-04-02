import { App } from '@aws-cdk/core';

import { FrontStack } from './stacks/FrontStack';
import { AuthStack } from './stacks/AuthStack';
import { ApiStack } from './stacks/ApiStack';
import { TrackStack } from './stacks/TrackStack';
import { CmsStack } from './stacks/CmsStack';

const app = new App();

const defaultProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new FrontStack(app, 'CleanFront', defaultProps);

const authStack = new AuthStack(app, 'CleanAuth', defaultProps);

const apiStack = new ApiStack(app, 'CleanApi', {
  ...defaultProps,
  userPool: authStack.userPool,
});

new CmsStack(app, 'CleanCMS', {
  ...defaultProps,
  dataTable: apiStack.table,
});

app.synth();
