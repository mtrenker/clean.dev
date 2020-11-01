import { Construct } from '@aws-cdk/core';
import { IUserPool } from '@aws-cdk/aws-cognito';
import {
  AuthorizationType,
  DynamoDbDataSource,
  FieldLogLevel,
  GraphqlApi,
  GraphqlType,
  LambdaDataSource,
  ObjectType,
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

  public static connectionResult = `
    {
      "totalCount": $util.toJson($ctx.result.scannedCount),
      "items": $util.toJson($ctx.result.items),
      "cursor": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
    }
  `;

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

  static createMutationResponse(type: ObjectType, api: GraphqlApi): ObjectType {
    const mutationResponseType = new ObjectType(`${type.name}MutationResponse`, {
      definition: {
        code: GraphqlType.string({ isRequired: true }),
        success: GraphqlType.boolean({ isRequired: true }),
        message: GraphqlType.string({ isRequired: true }),
        [type.name.toLowerCase()]: type.attribute({ isRequired: true }),
      },
    });
    api.addType(mutationResponseType);
    return mutationResponseType;
  }

  static createConnection(type: ObjectType, api: GraphqlApi): ObjectType {
    const connectionType = new ObjectType(`${type.name}Connection`, {
      definition: {
        items: type.attribute({
          isList: true,
          isRequired: true,
          isRequiredList: true,
        }),
        totalCount: GraphqlType.int({
          isRequired: true,
        }),
        cursor: GraphqlType.string(),
      },
    });
    api.addType(connectionType);
    return connectionType;
  }
}
