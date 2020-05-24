import {
  Stack, App, StackProps, RemovalPolicy,
} from '@aws-cdk/core';
import {
  GraphQLApi, DynamoDbDataSource, MappingTemplate, UserPoolDefaultAction, CfnApiKey,
} from '@aws-cdk/aws-appsync';
import { IUserPool } from '@aws-cdk/aws-cognito';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Role, ManagedPolicy, ServicePrincipal } from '@aws-cdk/aws-iam';

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
        name: 'sortKey',
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
        additionalAuthorizationModes: [{
          apiKeyDesc: 'Public API Key',
        }],
      },
    });

    this.apiKey = new CfnApiKey(this, 'ApiKey', {
      apiId: this.graphQLApi.apiId,
    });

    const queryDataSource = this.graphQLApi.addDynamoDbDataSource('DataSource', 'QueryDataSource', this.table);
    ApiStack.addCvResolver(queryDataSource);
    ApiStack.addPageResolver(queryDataSource);
    ApiStack.addTrackingsResolver(queryDataSource);

    const trackFunction = this.trackFunction();
    this.table.grantReadWriteData(trackFunction);
    this.trackResolver(trackFunction);
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
              "id" : $util.dynamodb.toDynamoDBJson("page-$ctx.args.input.slug"),
              "sortKey" : $util.dynamodb.toDynamoDBJson("page-$ctx.args.input.slug")
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
              "sortKey" : { "S" : "projects-cv" }
          }
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result.projects)'),
    });
  }

  static addTrackingsResolver(queryDataSource: DynamoDbDataSource): void {
    queryDataSource.createResolver({
      fieldName: 'trackings',
      typeName: 'Query',
      requestMappingTemplate: MappingTemplate.fromFile('cdk/resources/vtl/trackingQuery.vtl'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });
  }

  private trackFunction(): Function {
    const TrackMutationRole = new Role(this, 'TrackMutationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    return new Function(this, 'TrackFunction', {
      code: Code.fromAsset('cdk/resources/lambda/track-mutation'),
      handler: 'mutation.handler',
      runtime: Runtime.NODEJS_12_X,
      role: TrackMutationRole,
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });
  }

  private trackResolver(trackFunction: Function): void {
    const trackSource = this.graphQLApi.addLambdaDataSource(
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
