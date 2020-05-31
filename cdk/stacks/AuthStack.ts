import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';
import {
  UserPool, OAuthScope, CfnUserPoolGroup, CfnUserPoolUser,
} from '@aws-cdk/aws-cognito';
import { StringParameter } from '@aws-cdk/aws-ssm';

export class AuthStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'cleanDevUserPool',
      signInAliases: {
        email: true,
        phone: false,
        username: false,
        preferredUsername: false,
      },
      passwordPolicy: {
        requireSymbols: false,
        requireUppercase: false,
        requireDigits: false,
      },
      autoVerify: {
        email: true,
        phone: false,
      },
    });

    const userPoolClient = userPool.addClient('Client', {
      userPoolClientName: 'cleanDevUserPoolClient',
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: ['https://clean.dev'],
      },
    });

    userPool.addDomain('Domain', {
      cognitoDomain: {
        domainPrefix: 'clean-auth',
      },
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admins',
    });

    new CfnUserPoolUser(this, 'AdminUser', {
      userPoolId: userPool.userPoolId,
      username: 'martin@pacabytes.io',
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      exportName: 'userPoolId',
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      exportName: 'userPoolClientId',
    });
  }
}
