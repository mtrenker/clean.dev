import { Construct, SecretValue, RemovalPolicy } from '@aws-cdk/core';
import { GitHubSourceAction, CodeBuildAction, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { Bucket } from '@aws-cdk/aws-s3';

interface GitHubBuildProps {
  owner: string;
  repo: string;
  branch: string;
  oauthToken: SecretValue;
}

export class GitHubBuild extends Construct {
  public readonly siteBucket: Bucket;

  public readonly storybookBucket: Bucket;

  constructor(scope: Construct, id: string, props: GitHubBuildProps) {
    super(scope, id);

    const {
      branch, oauthToken, owner, repo,
    } = props;

    const pipeline = new Pipeline(this, 'Pipeline');
    const project = new PipelineProject(this, 'Project');

    const siteBucket = new Bucket(this, 'Site', {
      bucketName: 'clean.dev',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.siteBucket = siteBucket;

    const storybookBucket = new Bucket(this, 'Storybook', {
      bucketName: 'sb.clean.dev',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.storybookBucket = storybookBucket;

    const sourceOutput = new Artifact();
    const siteOutput = new Artifact('siteArtifact');
    const storybookOutput = new Artifact('storybookArtifact');

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
