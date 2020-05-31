import {
  Stack, StackProps, App, SecretValue, CfnOutput,
} from '@aws-cdk/core';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import {
  ARecordProps, ARecord, AaaaRecord, RecordTarget, AaaaRecordProps, HostedZone,
} from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { CloudFrontWebDistribution, ViewerCertificate } from '@aws-cdk/aws-cloudfront';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';


import { StringParameter } from '@aws-cdk/aws-ssm';
import { GitHubBuild } from '../constructs/GitHubBuild';

export class FrontStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const certificateArn = StringParameter.fromStringParameterName(this, 'CertificateArn', 'cleanDevCert');

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', certificateArn.stringValue) as Certificate;

    const param = BuildEnvironmentVariableType.PARAMETER_STORE;
    const build = new GitHubBuild(this, 'Build', {
      oauthToken: SecretValue.secretsManager('clean/github'),
      branch: 'master',
      owner: 'mtrenker',
      repo: 'clean.dev',
      environment: {
        COGNITO_POOL_ID: { value: 'cleanDevUserPoolId', type: param },
        COGNITO_CLIENT_ID: { value: 'cleanDevUserPoolClientId', type: param },
        GRAPHQL_ENDPOINT: { value: 'cleanDevApiUrl', type: param },
        GRAPHQL_API_TOKEN: { value: 'cleanDevApiKey', type: param },
      },
    });

    const viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: ['clean.dev'],
    });

    const zone = HostedZone.fromLookup(this, 'HostedZone', { domainName: 'clean.dev' });

    const cloudFrontDistribution = new CloudFrontWebDistribution(this, 'Distribution', {
      errorConfigurations: [{
        errorCode: 404,
        responseCode: 200,
        errorCachingMinTtl: 0,
        responsePagePath: '/index.html',
      }, {
        errorCode: 403,
        responseCode: 200,
        errorCachingMinTtl: 0,
        responsePagePath: '/index.html',
      }],
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: build.siteBucket,
        },
        behaviors: [{
          isDefaultBehavior: true,
        }],
      }],
      viewerCertificate,
    });

    const recordProps: ARecordProps | AaaaRecordProps = {
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      zone,
    };

    new ARecord(this, 'CloudFrontARecord', recordProps);
    new AaaaRecord(this, 'CloudFrontAaaaRecord', recordProps);

    new CfnOutput(this, 'SiteURL', {
      value: cloudFrontDistribution.domainName,
    });

    new CfnOutput(this, 'StorybookURL', {
      value: build.storybookBucket.bucketWebsiteUrl,
    });
  }
}
