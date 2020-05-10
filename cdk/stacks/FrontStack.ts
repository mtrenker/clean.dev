import {
  Stack, StackProps, App, SecretValue, CfnOutput,
} from '@aws-cdk/core';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import {
  ARecordProps, ARecord, AaaaRecord, RecordTarget, AaaaRecordProps, HostedZone,
} from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { GraphQLApi, CfnApiKey } from '@aws-cdk/aws-appsync';
import { CloudFrontWebDistribution, ViewerCertificate } from '@aws-cdk/aws-cloudfront';
import { IUserPool, IUserPoolClient } from '@aws-cdk/aws-cognito';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';

import { IUserPool, IUserPoolClient } from '@aws-cdk/aws-cognito';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';
import { GitHubBuild } from '../constructs/GitHubBuild';

interface FrontStackProps extends StackProps {
  userPool: IUserPool;
  userPoolClient: IUserPoolClient;
  graphqlApi: GraphQLApi;
  apiKey: CfnApiKey;
}

export class FrontStack extends Stack {
  constructor(scope: App, id: string, props: FrontStackProps) {
    super(scope, id, props);

    const {
      userPool, userPoolClient, graphqlApi, apiKey,
    } = props;

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', this.node.tryGetContext('front-certificate')) as Certificate;

    const plaintext = BuildEnvironmentVariableType.PLAINTEXT;
    const build = new GitHubBuild(this, 'Build', {
      oauthToken: SecretValue.secretsManager('clean/github'),
      branch: 'master',
      owner: 'mtrenker',
      repo: 'clean.dev',
      environment: {
        COGNITO_POOL_ID: { value: userPool.userPoolId, type: plaintext },
        COGNITO_CLIENT_ID: { value: userPoolClient.userPoolClientId, type: plaintext },
        GRAPHQL_ENDPOINT: { value: graphqlApi.graphQlUrl, type: plaintext },
        GRAPHQL_API_TOKEN: { value: apiKey.attrApiKey, type: plaintext },
      },
    });

    const viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: ['clean.dev'],
    });

    const zone = HostedZone.fromLookup(this, 'HostedZone', { domainName: 'clean.dev' });

    const cloudFrontDistribution = new CloudFrontWebDistribution(this, 'Distribution', {
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
