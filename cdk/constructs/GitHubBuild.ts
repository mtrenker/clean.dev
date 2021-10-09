import { Construct, SecretValue, RemovalPolicy } from '@aws-cdk/core';
import { GitHubSourceAction, CodeBuildAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { Project, BuildEnvironmentVariable, BuildSpec } from '@aws-cdk/aws-codebuild';
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

  constructor(scope: Construct, id: string, props: GitHubBuildProps) {
    super(scope, id);

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

    const project = new Project(this, 'Project', {
      role: projectRole,
      environment: {
        privileged: true,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['npm i'],
          },
          build: {
            commands: ['npm run build'],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: [
            '**/*',
          ],
        },
      }),
    });

    const siteBucket = new Bucket(this, 'Site', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.siteBucket = siteBucket;

    const sourceOutput = new Artifact('source');
    const siteOutput = new Artifact('site');

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
      outputs: [siteOutput],
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

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [siteDeployAction],
    });
  }
}
