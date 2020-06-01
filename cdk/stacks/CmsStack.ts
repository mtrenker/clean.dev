import {
  Stack, App, StackProps, Fn,
} from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CfnApi } from '@aws-cdk/aws-apigatewayv2';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Topic } from '@aws-cdk/aws-sns';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { StringParameter } from '@aws-cdk/aws-ssm';

export class CmsStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const inventoryName = Fn.importValue('inventoryTableName');
    const table = Table.fromTableName(this, 'Table', inventoryName) as Table;

    const contentfulTopic = new Topic(this, 'ContentfulTopic');

    const webhookRole = new Role(this, 'WebhookFunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const webhookFunction = new Function(this, 'WebhookFunction', {
      code: Code.fromAsset('cdk/resources/lambda/cms-webhook'),
      runtime: Runtime.NODEJS_12_X,
      handler: 'webhook.handler',
      role: webhookRole,
      environment: {
        TOPIC_ARN: contentfulTopic.topicArn,
        TOPIC_REGION: this.region,
      },
    });

    contentfulTopic.grantPublish(webhookFunction);

    const apiRole = new Role(this, 'WebhookApiRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    webhookFunction.grantInvoke(apiRole);

    new CfnApi(this, 'WebhookApi', {
      name: 'Contenful Webhook receiver',
      description: 'Webhook that receives all updates from contentful and puts it onto a SQS queue',
      protocolType: 'HTTP',
      target: webhookFunction.functionArn,
      credentialsArn: apiRole.roleArn,
    });

    const contentFunction = new Function(this, 'ContentFunction', {
      code: Code.fromAsset('cdk/resources/lambda/cms-content'),
      runtime: Runtime.NODEJS_12_X,
      handler: 'content.handler',
      role: webhookRole,
      environment: {
        TABLE_NAME: table.tableName,
        REGION: this.region,
        CONTENTFUL_SPACE_ID: StringParameter.fromStringParameterName(this, 'ContentfulSpaceId', 'cleanDevContentfulSpaceId').stringValue,
        CONTENTFUL_API_KEY: StringParameter.fromStringParameterName(this, 'ContentfulApiKey', 'cleanDevContentfulApiToken').stringValue,
      },
    });

    table.grantWriteData(contentFunction);

    contentfulTopic.addSubscription(new LambdaSubscription(contentFunction));
  }
}
