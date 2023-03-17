import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class BlogStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const openApiKeySecret = Secret.fromSecretNameV2(this, 'OPENAPI-KEY', 'openai/api-key');
    const hygraphEndpoint = Secret.fromSecretNameV2(this, 'HYGRAPH-URL', 'hygraph/api-url');
    const hygraphToken = Secret.fromSecretNameV2(this, 'HYGRAPH-TOKEN', 'hygraph/api-token');
    const hygraphHookHandler = new NodejsFunction(this, 'webhook');
    openApiKeySecret.grantRead(hygraphHookHandler);
    hygraphEndpoint.grantRead(hygraphHookHandler);
    hygraphToken.grantRead(hygraphHookHandler);

    const webHookApi = new LambdaRestApi(this, 'webhook-api', {
      handler: hygraphHookHandler,
    });

    new CfnOutput(this, 'webhook-url', {
      value: webHookApi.url,
    });
  }
}
