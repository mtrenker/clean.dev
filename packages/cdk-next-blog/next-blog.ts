import { Construct } from 'constructs';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class NextBlog extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const draftSecret = new Secret(this, 'DraftModeSecret', {
      description: 'Secret for draft mode',
      secretName: 'DraftModeSecret',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    Tags.of(draftSecret).add('access', 'web');

  }
}
