import {
  Stack, StackProps, App, SecretValue,
} from '@aws-cdk/core';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import { GitHubBuild } from '../constructs/GitHubBuild';

export class FrontStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', this.node.tryGetContext('front-certificate')) as Certificate;

    const build = new GitHubBuild(this, 'Build', {
      oauthToken: SecretValue.secretsManager('clean/github'),
      branch: 'master',
      owner: 'mtrenker',
      repo: 'clean.dev',
    });
  }

  // old() {
  //   new StaticSite(this, 'CleanDevFront', {
  //     pipelineConfig: {
  //       branch: 'master',
  //       owner: 'mtrenker',
  //       repo: 'clean.dev',
  //       oauthToken: SecretValue.secretsManager('clean/github'),
  //     },
  //     cloudFrontConfig: {
  //       alias: 'clean.dev',
  //       certificate,
  //       zone: HostedZone.fromLookup(this, 'HostedZone', { domainName: 'clean.dev' }),
  //     },
  //   });
  // }
}
