import { Stack, App, StackProps } from '@aws-cdk/core';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';

export class CertStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'clean.dev',
      privateZone: false,
    });

    new DnsValidatedCertificate(this, 'CleanDevCert', {
      domainName: 'clean.dev',
      hostedZone,
    });

    new DnsValidatedCertificate(this, 'CleanDevAuthCert', {
      domainName: 'auth.clean.dev',
      hostedZone,
    });
  }
}
