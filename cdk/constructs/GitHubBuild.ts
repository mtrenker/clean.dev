import { Construct, SecretValue, RemovalPolicy } from '@aws-cdk/core';
import { GitHubSourceAction, CodeBuildAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { PipelineProject, BuildEnvironmentVariable } from '@aws-cdk/aws-codebuild';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect,
} from '@aws-cdk/aws-iam';

interface GitHubBuildProps {
  owner: string;
  repo: string;
  branch: string;
  oauthToken: SecretValue;
  environment: {
    [name: string]: BuildEnvironmentVariable;
  };
}

export class GitHubBuild extends Construct {
  public readonly siteBucket: Bucket;

  public readonly storybookBucket: Bucket;

  constructor(scope: Construct, id: string, props: GitHubBuildProps) {
    super(scope, id);

    const env = this.node.tryGetContext('env');

    const {
      branch, oauthToken, owner, repo, environment,
    } = props;

    const projectRole = new Role(this, 'PipelineRole', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        readParams: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['ssm:GetParameters', 'ssm:GetParameter'],
              resources: ['*'],
              effect: Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    const pipeline = new Pipeline(this, 'Pipeline');

    const project = new PipelineProject(this, 'Project', {
      role: projectRole,
    });

    const siteBucket = new Bucket(this, 'Site', {
      bucketName: `${env}.clean.dev`,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.siteBucket = siteBucket;

    const storybookBucket = new Bucket(this, 'Storybook', {
      bucketName: `sb.${env}.clean.dev`,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.storybookBucket = storybookBucket;

    const sourceOutput = new Artifact('source');
    const siteOutput = new Artifact('site');
    const storybookOutput = new Artifact('storybook');

    const sourceAction = new GitHubSourceAction({
      actionName: 'source',
      oauthToken,
      output: sourceOutput,
      owner,
      repo,
      branch,
    });

    pipeline.addStage({
      stageName: 'GetSource',
      actions: [sourceAction],
    });

    const buildAction = new CodeBuildAction({
      actionName: 'build',
      input: sourceOutput,
      project,
      outputs: [siteOutput, storybookOutput],
      environmentVariables: environment,
    });

    pipeline.addStage({
      stageName: 'BuildSource',
      actions: [buildAction],
    });

    const siteDeployAction = new S3DeployAction({
      actionName: 'DeploySite',
      bucket: siteBucket,
      input: siteOutput,
    });

    const storybookDeployAction = new S3DeployAction({
      actionName: 'DeployStorybook',
      bucket: storybookBucket,
      input: storybookOutput,
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [storybookDeployAction, siteDeployAction],
    });
  }
}
