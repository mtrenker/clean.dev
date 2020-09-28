import { Construct } from '@aws-cdk/core';
import {
  CfnUserPoolGroup,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import {
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';

interface UserProps {
  domain: string;
}

export class Users extends Construct {
  public readonly userPool: UserPool;

  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    const { domain } = props;

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'Users',
      selfSignUpEnabled: true,
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
    });

    this.userPoolClient = this.userPool.addClient('Client', {
      userPoolClientName: 'userpool',
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: [domain],
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    });

    new Role(this, 'AdminGroupRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admins',
    });
  }
}
