import { Stack, App, StackProps } from '@aws-cdk/core';
import {
  GraphQLApi, DynamoDbDataSource, MappingTemplate, UserPoolDefaultAction, CfnApiKey,
} from '@aws-cdk/aws-appsync';
import { UserPool } from '@aws-cdk/aws-cognito';
import { Table, ITable } from '@aws-cdk/aws-dynamodb';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import {
  Role, ManagedPolicy, ServicePrincipal, PolicyStatement, Effect,
} from '@aws-cdk/aws-iam';
import { StringParameter } from '@aws-cdk/aws-ssm';

export class ApiStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const inventoryName = StringParameter.fromStringParameterName(this, 'TableName', 'cleanDevInventoryName');
    const table = Table.fromTableName(this, 'Table', inventoryName.stringValue);

    const userPoolId = StringParameter.fromStringParameterName(this, 'UserPoolId', 'cleanDevUserPoolId');
    const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId.stringValue);

    const api = new GraphQLApi(this, 'GraphQLApi', {
      name: 'prod.api.clean.dev',
      schemaDefinitionFile: 'cdk/resources/schema.graphql',
      authorizationConfig: {
        defaultAuthorization: {
          userPool,
          defaultAction: UserPoolDefaultAction.ALLOW,
        },
        additionalAuthorizationModes: [{
          apiKeyDesc: 'Public API Key',
        }],
      },
    });

    const apiKey = new CfnApiKey(this, 'ApiKey', {
      apiId: api.apiId,
    });

    const eventBusName = StringParameter.fromStringParameterName(this, 'EventBusName', 'cleanDevEventBusName').stringValue;
    const queryDataSource = api.addDynamoDbDataSource('DataSource', 'QueryDataSource', table as Table);
    const trackFunction = this.trackFunction(table, eventBusName);

    ApiStack.addPageResolver(queryDataSource);
    ApiStack.addTrackingsResolver(queryDataSource);
    ApiStack.trackResolver(api, trackFunction);

    table.grantReadWriteData(trackFunction);

    new StringParameter(this, 'DevApiKeyParam', {
      stringValue: apiKey.attrApiKey,
      parameterName: 'cleanDevApiKey',
    });

    new StringParameter(this, 'ApiUrlParam', {
      stringValue: api.graphQlUrl,
      parameterName: 'cleanDevApiUrl',
    });
  }

  static addPageResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'page',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
          "version" : "2017-02-28",
          "operation" : "GetItem",
          "key" : {
              "pk" : $util.dynamodb.toDynamoDBJson("page-$ctx.args.input.slug"),
              "id" : $util.dynamodb.toDynamoDBJson("page-$ctx.args.input.slug")
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result)'),
    });
  }

  static addTrackingsResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'trackings',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromFile('cdk/resources/vtl/trackingQuery.vtl'),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "items": $util.toJson($ctx.result.items),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))
        }
      `),
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private trackFunction(table: ITable, eventBusName: string): Function {
    const trackMutationRole = new Role(this, 'TrackMutationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const eventBusArn = StringParameter.fromStringParameterName(this, 'EventBusArn', 'cleanDevEventBusArn');

    trackMutationRole.addToPolicy(new PolicyStatement({
      resources: [eventBusArn.stringValue],
      actions: ['events:PutEvents'],
      effect: Effect.ALLOW,
    }));

    return new Function(this, 'TrackFunction', {
      code: Code.fromAsset('cdk/resources/lambda/track-mutation'),
      handler: 'mutation.handler',
      runtime: Runtime.NODEJS_12_X,
      role: trackMutationRole,
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: eventBusName,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static trackResolver(api: GraphQLApi, trackFunction: Function): void {
    const trackSource = api.addLambdaDataSource(
      'TrackSource',
      'TrackSOurce', trackFunction,
    );
    trackSource.createResolver({
      fieldName: 'track',
      typeName: 'Mutation',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
  }
}
