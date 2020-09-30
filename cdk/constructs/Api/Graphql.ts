import { join } from 'path';
import { Construct } from '@aws-cdk/core';
import { IUserPool } from '@aws-cdk/aws-cognito';
import {
  AuthorizationType,
  DynamoDbDataSource,
  FieldLogLevel,
  GraphqlApi,
  LambdaDataSource,
  Schema,
  UserPoolDefaultAction,
} from '@aws-cdk/aws-appsync';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import {
  createMeResolver, createMutationResolver, createProjectTrackingsResolver, createUserProjectsResolver,
} from './resolvers';

interface GraphqlProps {
 userPool: IUserPool;
 table: ITable;
}

export class Graphql extends Construct {
  public readonly api: GraphqlApi

  public readonly querySource: DynamoDbDataSource;

  public readonly mutationSource: LambdaDataSource;

  constructor(scope: Construct, id: string, props: GraphqlProps) {
    super(scope, id);

    const { table, userPool } = props;

    const mutationFunction = new NodejsFunction(this, 'mutations', {
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantFullAccess(mutationFunction);

    this.api = new GraphqlApi(this, 'GraphQLApi', {
      name: 'api',
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: true,
      schema: Schema.fromAsset(join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
      },
    });
    this.querySource = this.api.addDynamoDbDataSource('InventoryDataSource', table);
    this.mutationSource = this.api.addLambdaDataSource('MutationDataSource', mutationFunction);

    // attach Query resolvers
    this.createQueryResolvers();
    // attach Mutation resolvers
    this.createMutationResolvers();
  }

  createQueryResolvers(): void {
    // User
    createMeResolver(this.querySource);
    // User > Projects
    createUserProjectsResolver(this.querySource);
    // Project -> Trackings
    createProjectTrackingsResolver(this.querySource);
  }

  createMutationResolvers(): void {
    createMutationResolver(this.mutationSource, 'addProject');
    createMutationResolver(this.mutationSource, 'addTracking');
  }
}
