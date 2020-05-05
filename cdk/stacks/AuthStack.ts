import { Stack, App, StackProps } from '@aws-cdk/core';
import {
  UserPool, IUserPool, OAuthScope,
} from '@aws-cdk/aws-cognito';

export class AuthStack extends Stack {
  public readonly userPool: IUserPool;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'UserPool', {
      autoVerify: {
        email: true,
        phone: false,
      },
    });
    userPool.addClient('app-client', {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: ['https://clean.dev'],
      },
    });

    userPool.addDomain('app-domain', {
      cognitoDomain: {
        domainPrefix: 'clean-dev',
      },
    });

    this.userPool = userPool;
  }
}
