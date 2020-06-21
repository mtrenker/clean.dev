import {
  Stack, App, StackProps, CfnOutput, Fn,
} from '@aws-cdk/core';
import {
  GraphQLApi, DynamoDbDataSource, MappingTemplate, UserPoolDefaultAction, CfnApiKey, AuthorizationType, KeyCondition, FieldLogLevel,
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

    const eventBusArn = Fn.importValue('eventBusArn');
    const inventoryName = Fn.importValue('inventoryTableName');
    const eventBusName = Fn.importValue('eventBusName');
    const userPoolId = StringParameter.fromStringParameterName(this, 'UserPoolId', 'cleanDevUserPoolId');

    const table = Table.fromTableName(this, 'Table', inventoryName) as Table;
    const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId.stringValue);

    const api = new GraphQLApi(this, 'GraphQLApi', {
      name: 'prod.api.clean.dev',
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL
      },
      schemaDefinitionFile: 'cdk/resources/schema.graphql',
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
        additionalAuthorizationModes: [{
          authorizationType: AuthorizationType.API_KEY,
        }],
      },
    });

    const apiKey = new CfnApiKey(this, 'ApiKey', {
      apiId: api.apiId,
    });

    const queryDataSource = api.addDynamoDbDataSource('DataSource', 'QueryDataSource', table);
    const trackFunction = this.trackFunction(table, eventBusArn, eventBusName);

    ApiStack.addPageResolver(queryDataSource);
    ApiStack.addProjectsResolver(queryDataSource);
    ApiStack.addTrackingsResolver(queryDataSource);
    ApiStack.trackResolver(api, trackFunction);

    table.grantReadWriteData(trackFunction);

    new StringParameter(this, 'ApiKeyParam', {
      stringValue: apiKey.attrApiKey,
      parameterName: 'cleanDevApiKey',
    });

    new StringParameter(this, 'GraphQlUrlParam', {
      stringValue: api.graphQlUrl,
      parameterName: 'cleanDevApiUrl',
    });

    new CfnOutput(this, 'ApiKeyOutput', {
      value: apiKey.attrApiKey,
      exportName: 'apiKey',
    });

    new CfnOutput(this, 'ApiUrlOutput', {
      value: api.graphQlUrl,
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

  static addProjectsResolver(queryDataSource: DynamoDbDataSource): void {
    // const keyCondition = KeyCondition.beginsWith('id', 'project')
    queryDataSource.createResolver({
      fieldName: 'projects',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation" : "Query",
          "query":{
            "expression": "pk = :user AND begins_with(id, :id)",
            "expressionValues": {
              ":id": $util.dynamodb.toDynamoDBJson("project-"),
              ":user": $util.dynamodb.toDynamoDBJson($ctx.identity.sub)
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "items": $util.toJson($ctx.result.items),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))
        }
      `),
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
  private trackFunction(table: ITable, eventBusArn: string, eventBusName: string): Function {
    const trackMutationRole = new Role(this, 'TrackMutationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    trackMutationRole.addToPolicy(new PolicyStatement({
      resources: [eventBusArn],
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
