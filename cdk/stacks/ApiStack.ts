import {
  Stack, App, StackProps, RemovalPolicy,
} from '@aws-cdk/core';
import {
  GraphQLApi, DynamoDbDataSource, MappingTemplate, UserPoolDefaultAction, CfnApiKey,
} from '@aws-cdk/aws-appsync';
import { IUserPool } from '@aws-cdk/aws-cognito';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

interface ApiStackProps extends StackProps {
  userPool: IUserPool;
}

export class ApiStack extends Stack {
  public readonly graphQLApi: GraphQLApi;

  public readonly table: Table;

  public readonly apiKey: CfnApiKey;

  constructor(scope: App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { userPool } = props;

    this.table = new Table(this, 'CleanTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sort_key',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.graphQLApi = new GraphQLApi(this, 'GraphQL', {
      name: 'clean-api',
      schemaDefinitionFile: 'cdk/resources/schema.graphql',
      authorizationConfig: {
        defaultAuthorization: {
          userPool,
          defaultAction: UserPoolDefaultAction.ALLOW,
        },
      },
    });

    this.apiKey = new CfnApiKey(this, 'ApiKey', {
      apiId: this.graphQLApi.apiId,
    });

    const queryDataSource = this.graphQLApi.addDynamoDbDataSource('DataSource', 'QueryDataSource', this.table);
    ApiStack.addCvResolver(queryDataSource);
    ApiStack.addPageResolver(queryDataSource);
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
              "id" : { "S" : "page-$ctx.args.input.slug" },
              "sort_key" : { "S" : "page-$ctx.args.input.slug" }
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result)'),
    });
  }

  static addCvResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'projects',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromString(`
      {
          "version" : "2017-02-28",
          "operation" : "GetItem",
          "key" : {
              "id" : { "S" : "projects-cv" },
              "sort_key" : { "S" : "projects-cv" }
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result.projects)'),
    });
  }
}
