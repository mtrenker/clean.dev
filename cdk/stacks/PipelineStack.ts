import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import {
  Construct, SecretValue, Stack, StackProps,
} from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

import { Application } from '../stages/Application';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact();

    const sourceAction = new GitHubSourceAction({
      actionName: 'Source',
      output: sourceArtifact,
      oauthToken: SecretValue.secretsManager('github/token'),
      owner: 'mtrenker',
      repo: 'clean.dev',
      branch: 'main',
    });

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      cloudAssemblyArtifact,
      sourceAction,
      crossAccountKeys: false,
      synthAction: SimpleSynthAction.standardNpmSynth({
        rolePolicyStatements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['route53:ListHostedZonesByName'],
            resources: ['*'],
          }),
        ],
        cloudAssemblyArtifact,
        sourceArtifact,
        synthCommand: 'npm run synth',
      }),
    });

    pipeline.addApplicationStage(new Application(this, 'Prod', props));
  }
}
