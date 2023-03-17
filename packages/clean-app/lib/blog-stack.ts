import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class BlogStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hygraphHookHandler = new NodejsFunction(this, 'webhook', {
      environment: {
        OPENAI_API_KEY: Secret.fromSecretNameV2(this, 'OPENAI-API', 'openai/api-key').secretValue.toString(),
        HYGRAPH_API_URL: Secret.fromSecretNameV2(this, 'HYGRAPH-API-URL', 'hygraph/api-url').secretValue.toString(),
        HYGRAPH_API_TOKEN: Secret.fromSecretNameV2(this, 'HYGRAPH-API-TOKEN', 'hygraph/api-token').secretValue.toString(),
      },
    });

    const webHookApi = new LambdaRestApi(this, 'webhook-api', {
      handler: hygraphHookHandler,
    });

    new CfnOutput(this, 'webhook-url', {
      value: webHookApi.url,
    });
  }
}
