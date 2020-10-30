import { Construct } from '@aws-cdk/core';
import { IUserPool } from '@aws-cdk/aws-cognito';
import {
  AuthorizationType,
  DynamoDbDataSource,
  FieldLogLevel,
  GraphqlApi,
  LambdaDataSource,
  UserPoolDefaultAction,
} from '@aws-cdk/aws-appsync';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';

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

    this.api = new GraphqlApi(this, 'GraphQLApi', {
      name: 'api',
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: true,
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

    this.querySource = this.api.addDynamoDbDataSource('InventoryDataSource', table);

    this.querySource.grantPrincipal.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:BatchGetItem',
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:Query',
        'dynamodb:GetItem',
      ],
      resources: [
        table.tableArn,
        `${table.tableArn}/index/GSI1`,
      ],
    }));
  }
}
