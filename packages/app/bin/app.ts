#!/usr/bin/env node
import 'source-map-support/register';
import { AppStage } from '../lib/app-stage';
import { App } from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';

const defaultProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

const app = new App();
new PipelineStack(app, 'PipelineStack', defaultProps);
