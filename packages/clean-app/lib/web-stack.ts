import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BuildSpec, LinuxBuildImage, Project } from 'aws-cdk-lib/aws-codebuild';
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
          ],
        }),
      },
    });

    const project = new Project(this, 'Project', {
      role: projectRole,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'npm i -g npm@8.4',
              'node -v',
              'npm -v',
              'npm ci',
            ],
          },
          build: {
            commands: [
              'npm run build -w packages/clean-web',
            ],
          },
        },
        artifacts: {
          'base-directory': 'packages/clean-web/out',
          files: [
            '**/*',
          ],
        },
      }),
    });

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
