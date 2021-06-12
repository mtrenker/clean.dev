import {
  Stack, StackProps, SecretValue, CfnOutput, Construct,
} from '@aws-cdk/core';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import {
  ARecordProps, ARecord, AaaaRecord, RecordTarget, AaaaRecordProps, HostedZone,
} from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Distribution } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';

import { GitHubBuild } from '../constructs/GitHubBuild';

export class FrontStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const domainName = 'clean.dev';

    const hostedZone = HostedZone.fromLookup(this, 'Zone', {
      domainName,
    });

    const certificate = new DnsValidatedCertificate(this, 'Cert', {
      domainName,
      hostedZone,
      region: 'us-east-1',
    });

    const param = BuildEnvironmentVariableType.PARAMETER_STORE;
    const build = new GitHubBuild(this, 'Build', {
      oauthToken: SecretValue.secretsManager('github/token'),
      branch: 'main',
      owner: 'mtrenker',
      repo: 'clean.dev',
      environment: {
        COGNITO_POOL_ID: { value: 'userPoolId', type: param },
        COGNITO_CLIENT_ID: { value: 'userPoolClientId', type: param },
        GRAPHQL_ENDPOINT: { value: 'apiUrl', type: param },
      },
    });

    const cloudFrontDistribution = new Distribution(this, 'CloudFront', {
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
        origin: new S3Origin(build.siteBucket),
      },
      domainNames: [domainName],
      certificate,
    });
    const recordProps: ARecordProps | AaaaRecordProps = {
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      zone: hostedZone,
    };

    new ARecord(this, 'ARecord', recordProps);
    new AaaaRecord(this, 'AaaaRecord', recordProps);

    new CfnOutput(this, 'Website', {
      value: hostedZone.zoneName,
    });
  }
}
