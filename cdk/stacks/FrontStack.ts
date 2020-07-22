import {
  Stack, StackProps, App, SecretValue, CfnOutput, Fn,
} from '@aws-cdk/core';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import {
  ARecordProps, ARecord, AaaaRecord, RecordTarget, AaaaRecordProps, HostedZone,
} from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { CloudFrontWebDistribution, ViewerCertificate } from '@aws-cdk/aws-cloudfront';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';

import { GitHubBuild } from '../constructs/GitHubBuild';

export class FrontStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'Zone', {
      domainName: 'clean.dev',
    });

    const certificate = Certificate.fromCertificateArn(this, 'Cert', Fn.importValue('CertificateArn'));

    const param = BuildEnvironmentVariableType.PARAMETER_STORE;
    const build = new GitHubBuild(this, 'Build', {
      oauthToken: SecretValue.secretsManager('clean/github'),
      branch: 'main',
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
      aliases: ['clean.dev', '*.clean.dev'],
    });

    const cloudFrontDistribution = new CloudFrontWebDistribution(this, 'Dist', {
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
      zone: hostedZone,
    };

    new ARecord(this, 'ARecord', recordProps);
    new AaaaRecord(this, 'AaaaRecord', recordProps);

    new CfnOutput(this, 'SiteUrl', {
      value: cloudFrontDistribution.domainName,
    });

    new CfnOutput(this, 'StorybookUrl', {
      value: build.storybookBucket.bucketWebsiteUrl,
    });

    new CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
    });
  }
}
