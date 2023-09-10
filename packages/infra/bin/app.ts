#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import type { PipelineStackProps } from '../lib/pipeline-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const repository = 'mtrenker/clean.dev';
const branch = 'main';

const pipelineProps: PipelineStackProps = {
  packagePath: 'packages/infra',
  repository,
  branch,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT!,
    region: process.env.CDK_DEFAULT_REGION!,
  },
};

const app = new App();
new PipelineStack(app, 'Pipeline', pipelineProps);
