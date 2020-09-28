import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';
import { StringParameter } from '@aws-cdk/aws-ssm';

import { Users } from '../constructs/Users/Users';

export class AuthStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const domain = 'https://clean.dev';

    const users = new Users(this, 'Users', {
      domain,
    });

    new StringParameter(this, 'UserPoolIdParam', {
      stringValue: users.userPool.userPoolId,
      parameterName: 'userPoolId',
    });

    new StringParameter(this, 'UserPoolClientIdParam', {
      stringValue: users.userPoolClient.userPoolClientId,
      parameterName: 'userPoolClientId',
    });

    new CfnOutput(this, 'UserPoolId', {
      value: users.userPool.userPoolId,
      exportName: 'userPoolId',
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: users.userPoolClient.userPoolClientId,
      exportName: 'userPoolClientId',
    });
  }
}
