import { Construct } from '@aws-cdk/core';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { CfnApi } from '@aws-cdk/aws-apigatewayv2';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

interface ContentfulProps {
  table: ITable;
  spaceId: string;
  apiKey: string;
}

export class Contentful extends Construct {
  constructor(scope: Construct, id: string, props: ContentfulProps) {
    super(scope, id);

    const { apiKey, spaceId, table } = props;

    const webhookRole = new Role(this, 'WebhookFunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const webhookFunction = new NodejsFunction(this, 'webhook', {
      role: webhookRole,
      environment: {
        TABLE_NAME: table.tableName,
        CONTENTFUL_SPACE_ID: spaceId,
        CONTENTFUL_API_KEY: apiKey,
      },
    });

    const apiRole = new Role(this, 'WebhookApiRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    webhookFunction.grantInvoke(apiRole);
    table.grantReadWriteData(webhookFunction);

    new CfnApi(this, 'WebhookApi', {
      name: 'Contenful Webhook receiver',
      description: 'Webhook that receives all updates from contentful and saves it to the inventory table',
      protocolType: 'HTTP',
      target: webhookFunction.functionArn,
      credentialsArn: apiRole.roleArn,
    });
  }
}
