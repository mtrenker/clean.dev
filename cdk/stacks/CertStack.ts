import { Stack, App, StackProps } from '@aws-cdk/core';
import { Certificate, DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';

export class CertStack extends Stack {
  public readonly siteCert: Certificate;

  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'clean.dev',
      privateZone: false,
    });

    this.siteCert = new DnsValidatedCertificate(this, 'TestCertificate', {
      domainName: 'clean.dev',
      hostedZone,
    });
  }
}
