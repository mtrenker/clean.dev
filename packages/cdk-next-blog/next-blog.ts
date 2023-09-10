import { Construct } from 'constructs';
import { RemovalPolicy, Tags } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class NextBlog extends Construct {
  draftSecret: Secret;
  apiSecret: Secret;
  webhookSecret: Secret;
  codeFetcherSecret: Secret;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.draftSecret = new Secret(this, 'DraftModeSecret', {
      description: 'Secret to enable draft mode in production',
      secretName: 'clean/blog/draft-mode-secret',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.apiSecret = new Secret(this, 'ApiTokenSecret', {
      description: 'API token to access the blog API',
      secretName: 'clean/blog/api-secret',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.webhookSecret = new Secret(this, 'WebhookSecret', {
      description: 'Secret to verify webhook calls from the blog API',
      secretName: 'clean/blog/webhook-secret',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.codeFetcherSecret = new Secret(this, 'CodeFetcherSecret', {
      description: 'Secret for accessing the github api',
      secretName: 'clean/blog/github-secret',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
