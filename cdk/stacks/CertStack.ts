import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';

export class CertStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'clean.dev',
    });

    const certificate = new DnsValidatedCertificate(this, 'CleanDevCert', {
      domainName: 'clean.dev',
      subjectAlternativeNames: ['*.clean.dev'],
      hostedZone,
      region: 'us-east-1',
    });

    new CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
      exportName: 'CertificateArn',
    });
  }
}
