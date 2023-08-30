#!/usr/bin/env node
import 'source-map-support/register';
import { App, CfnParameter } from 'aws-cdk-lib';
import { PipelineStack, PipelineStackProps } from '../lib/pipeline-stack';

const repository = 'mtrenker/clean.dev';
const branch = 'main';

const pipelineProps: PipelineStackProps = {
  packagePath: 'packages/infra',
  repository,
  branch,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT as string,
    region: process.env.CDK_DEFAULT_REGION as string,
  },
};

const app = new App();
new PipelineStack(app, 'Pipeline', pipelineProps);
