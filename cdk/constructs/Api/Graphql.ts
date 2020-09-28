import { join } from 'path';
import { Construct } from '@aws-cdk/core';
import { IUserPool } from '@aws-cdk/aws-cognito';
import {
  AuthorizationType,
  FieldLogLevel,
  GraphqlApi,
  Schema,
  UserPoolDefaultAction,
} from '@aws-cdk/aws-appsync';

interface GraphqlProps {
 userPool: IUserPool
}

export class Graphql extends Construct {
  public readonly api: GraphqlApi

  constructor(scope: Construct, id: string, props: GraphqlProps) {
    super(scope, id);

    const { userPool } = props;

    this.api = new GraphqlApi(this, 'GraphQLApi', {
      name: 'api',
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: Schema.fromAsset(join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: UserPoolDefaultAction.DENY,
          },
        },
      },
    });
  }
}
