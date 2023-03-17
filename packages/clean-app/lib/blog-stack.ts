import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class BlogStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hygraphHookHandler = new NodejsFunction(this, 'webhook');

    const webHookApi = new LambdaRestApi(this, 'webhook-api', {
      handler: hygraphHookHandler,
    });

    new CfnOutput(this, 'webhook-url', {
      value: webHookApi.url,
    });
  }
}
