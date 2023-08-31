import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class NextBlog extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Secret(this, 'DraftModeSecret', {
      description: 'Secret for draft mode',
      secretName: 'DraftModeSecret',
      removalPolicy: RemovalPolicy.DESTROY,
    });

  }
}
