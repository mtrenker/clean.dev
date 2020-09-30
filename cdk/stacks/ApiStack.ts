import {
  Stack,
  App,
  StackProps,
  CfnOutput,
  Fn,
} from '@aws-cdk/core';
import {
  DynamoDbDataSource,
  NoneDataSource,
  MappingTemplate,
} from '@aws-cdk/aws-appsync';
import { UserPool } from '@aws-cdk/aws-cognito';
import { ITable, Table } from '@aws-cdk/aws-dynamodb';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import {
  Role, ManagedPolicy, ServicePrincipal, PolicyStatement, Effect,
} from '@aws-cdk/aws-iam';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Graphql } from '../constructs/Api/Graphql';

export class ApiStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    // const eventBusArn = Fn.importValue('eventBusArn');
    // const eventBusName = Fn.importValue('eventBusName');

    const inventoryName = Fn.importValue('inventoryTableName');
    const userPoolId = StringParameter.fromStringParameterName(this, 'UserPoolId', 'userPoolId');

    const table = Table.fromTableName(this, 'Table', inventoryName);
    const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId.stringValue);

    const { api } = new Graphql(this, 'Graphql', {
      userPool,
      table,
    });

    new StringParameter(this, 'GraphQlUrlParam', {
      stringValue: api.graphqlUrl,
      parameterName: 'apiUrl',
    });

    new CfnOutput(this, 'ApiUrlOutput', {
      value: api.graphqlUrl,
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
              ":user": $util.dynamodb.toDynamoDBJson("User-$ctx.identity.claims['custom:user']")
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
              "pk" : $util.dynamodb.toDynamoDBJson("User-$ctx.identity.claims['custom:user']"),
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
