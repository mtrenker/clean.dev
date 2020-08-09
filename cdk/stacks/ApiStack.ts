import {
  Stack, App, StackProps, CfnOutput, Fn,
} from '@aws-cdk/core';
import {
  GraphQLApi,
  DynamoDbDataSource,
  NoneDataSource,
  MappingTemplate,
  UserPoolDefaultAction,
  CfnApiKey,
  AuthorizationType,
  FieldLogLevel,
  SchemaDefinition,
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
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schemaDefinition: SchemaDefinition.FILE,
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
    const noneDataSource = api.addNoneDataSource('None', 'NoneDataSource');
    const mutationsFunction = this.mutationsFunction(table, eventBusArn, eventBusName);

    const mutationsSource = api.addLambdaDataSource('TrackSource', 'TrackSOurce', mutationsFunction);

    ApiStack.addPageResolver(queryDataSource);

    ApiStack.addProjectsResolver(queryDataSource);
    ApiStack.addProjectResolver(queryDataSource);

    ApiStack.addTrackingsResolver(queryDataSource);

    ApiStack.addBlogResolver(noneDataSource);
    ApiStack.addBlogPostResolver(queryDataSource);
    ApiStack.addBlogListResolver(queryDataSource);

    mutationsSource.createResolver({
      fieldName: 'track',
      typeName: 'Mutation',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
    mutationsSource.createResolver({
      fieldName: 'addProject',
      typeName: 'Mutation',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });

    table.grantReadWriteData(mutationsFunction);

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
              "pk" : $util.dynamodb.toDynamoDBJson("page-/$ctx.args.pageQuery.slug"),
              "id" : $util.dynamodb.toDynamoDBJson("page-/$ctx.args.pageQuery.slug")
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result)'),
    });
  }

  static addBlogResolver(dataSource: NoneDataSource): void {
    dataSource.createResolver({
      fieldName: 'blog',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromString(JSON.stringify({
        version: '2017-02-28',
        payload: {
          post: {},
        },
      })),
      responseMappingTemplate: MappingTemplate.fromString('$utils.toJson($ctx.result)'),
    });
  }

  static addBlogPostResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'post',
      typeName: 'Blog',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
          "version" : "2017-02-28",
          "operation" : "GetItem",
          "key" : {
              "pk" : $util.dynamodb.toDynamoDBJson("blog-$ctx.args.blogPostQuery.post"),
              "id" : $util.dynamodb.toDynamoDBJson("blog-$ctx.args.blogPostQuery.post")
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result)'),
    });
  }

  static addBlogListResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'list',
      typeName: 'Blog',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
          "version" : "2017-02-28",
          "operation" : "GetItem",
          "key" : {
              "pk" : $util.dynamodb.toDynamoDBJson("blog-list"),
              "id" : $util.dynamodb.toDynamoDBJson("blog-list")
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "items": $util.toJson($ctx.result.blogPosts)
        }
      `),
    });
  }

  static addProjectsResolver(queryDataSource: DynamoDbDataSource): void {
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
              ":user": $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub")
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "items": $util.toJson($ctx.result.items),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
        }
      `),
    });
  }

  static addProjectResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'project',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
          "version" : "2017-02-28",
          "operation" : "GetItem",
          "key" : {
              "pk" : $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub"),
              "id" : $util.dynamodb.toDynamoDBJson("$ctx.args.projectQuery.project")
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
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
        }
      `),
    });

    queryDataSource.createResolver({
      fieldName: 'trackings',
      typeName: 'Project',
      requestMappingTemplate: MappingTemplate.fromFile('cdk/resources/vtl/trackingQuery.vtl'),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "items": $util.toJson($ctx.result.items),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
        }
      `),
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private mutationsFunction(table: ITable, eventBusArn: string, eventBusName: string): Function {
    const mutationsRole = new Role(this, 'MutationsRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    mutationsRole.addToPolicy(new PolicyStatement({
      resources: [eventBusArn],
      actions: ['events:PutEvents'],
      effect: Effect.ALLOW,
    }));

    return new Function(this, 'Mutations', {
      code: Code.fromAsset('cdk/resources/lambda/mutations'),
      handler: 'mutations.handler',
      runtime: Runtime.NODEJS_12_X,
      role: mutationsRole,
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: eventBusName,
      },
    });
  }
}
