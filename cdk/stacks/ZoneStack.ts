import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { PublicHostedZone } from '@aws-cdk/aws-route53';

export class ZoneStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const zoneName = 'clean.dev';
    new PublicHostedZone(this, 'Zone', {
      zoneName,
    });
  }
}
