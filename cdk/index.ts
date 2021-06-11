import { App } from '@aws-cdk/core';

import { PipelineStack } from './stacks/PipelineStack';
import { ZoneStack } from './stacks/ZoneStack';

const app = new App();

const defaultProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new PipelineStack(app, 'Pipeline', defaultProps);
new ZoneStack(app, 'Zone', defaultProps);
