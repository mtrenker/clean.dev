import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BuildEnvironmentVariableType, BuildSpec, Cache, LinuxBuildImage, Project } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeStarConnectionsSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { AaaaRecord, AaaaRecordProps, ARecord, ARecordProps, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class WebStack extends Stack {
  constructor (scope: Construct, id: string) {
    super(scope, id);

    const domainName = 'clean.dev';
    const owner = 'mtrenker';
    const repo = 'clean.dev';
    const branch = 'main';

    const connectionArn = Secret.fromSecretNameV2(this, 'ConnectionSecret', 'github/connection').secretValue.unsafeUnwrap();

    const siteBucket = new Bucket(this, 'SiteBucket', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const pipeline = new Pipeline(this, 'Pipeline');

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
            new PolicyStatement({
              actions: ['s3:ListObjectsV2', 's3:ListBucket', 's3:DeleteObject'],
              resources: [siteBucket.bucketArn],
              effect: Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    const cacheBucket = new Bucket(this, 'CacheBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const project = new Project(this, 'Project', {
      role: projectRole,
      cache: Cache.bucket(cacheBucket),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      environmentVariables: {
        NEXT_PUBLIC_AWS_REGION: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: 'eu-central-1',
        },
        NEXT_PUBLIC_COGNITO_POOL_ID: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: 'userPoolId',
        },
        NEXT_PUBLIC_COGNITO_CLIENT_ID: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: 'userPoolClientId',
        },
        NEXT_PUBLIC_GRAPHQL_URL: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: 'graphqlUrl',
        },
        NEXT_PUBLIC_HYGRAPH_API: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: 'hygraphApi',
        },
        ARTIFACTS_BUCKET: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: siteBucket.bucketName,
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'corepack enable',
              'corepack prepare pnpm@latest-8 --activate',
              'pnpm i',
            ],
          },
          build: {
            commands: [
              'npm run build -w packages/clean-web',
              'npm run export -w packages/clean-web',
              'aws s3 rm --recursive "s3://${ARTIFACTS_BUCKET}/"',
            ],
          },
        },
        artifacts: {
          'base-directory': 'packages/clean-web/out',
          files: [
            '**/*',
          ],
        },
        cache: {
          paths: [
            'packages/clean-web/node_modules/**/*',
            'packages/clean-web/.next/cache/**/*',
          ],
        },
      }),
    });

    siteBucket.grantDelete(project);

    const sourceOutput = new Artifact('source');
    const siteOutput = new Artifact('site');

    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: 'Source',
      connectionArn,
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

    const hostedZone = HostedZone.fromLookup(this, 'Zone', {
      domainName,
    });

    const certificate = new DnsValidatedCertificate(this, 'Cert', {
      domainName,
      hostedZone,
      region: 'us-east-1',
    });

    const distribution = new Distribution(this, 'Distribution', {
      errorResponses: [{
        httpStatus: 404,
        responsePagePath: '/index.html',
        responseHttpStatus: 200,
      }, {
        httpStatus: 403,
        responsePagePath: '/index.html',
        responseHttpStatus: 200,
      }],
      defaultBehavior: {
        origin: new S3Origin(siteBucket),
      },
      domainNames: [domainName],
      certificate,
    });

    const recordProps: ARecordProps | AaaaRecordProps = {
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
    };

    new ARecord(this, 'ARecord', recordProps);
    new AaaaRecord(this, 'AaaaRecord', recordProps);
  }
}
