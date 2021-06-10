import {
  Stack,
  StackProps,
  CfnOutput,
  Fn,
  Construct,
} from '@aws-cdk/core';
import { UserPool } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Graphql } from '../constructs/Api/Graphql';
import { BlogApi } from '../constructs/Blog/BlogApi';
import { ProjectsApi } from '../constructs/Projects/ProjectsApi';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const inventoryName = Fn.importValue('inventoryTableName');
    const userPoolId = StringParameter.fromStringParameterName(this, 'UserPoolId', 'userPoolId');

    const table = Table.fromTableName(this, 'Table', inventoryName);
    const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId.stringValue);

    const { api, querySource } = new Graphql(this, 'Graphql', {
      userPool,
      table,
    });

    new BlogApi(this, 'BlogApi', {
      api,
      querySource,
    });

    new ProjectsApi(this, 'ProjectsApi', {
      api,
      table,
      querySource,
    });

    new StringParameter(this, 'GraphQlUrlParam', {
      stringValue: api.graphqlUrl,
      parameterName: 'apiUrl',
    });

    new CfnOutput(this, 'ApiUrlOutput', {
      value: api.graphqlUrl,
    });
  }
}
