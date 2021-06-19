import { Construct } from '@aws-cdk/core';
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolGroup,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import {
  FederatedPrincipal,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';

interface UserProps {
  domain: string;
}

export class Users extends Construct {
  public readonly userPool: UserPool;

  public readonly userPoolClient: UserPoolClient;

  public readonly identityPool: CfnIdentityPool

  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    const { domain } = props;

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'Users',
      selfSignUpEnabled: false,
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

    const adminRole = new Role(this, 'AdminGroupRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admins',
      roleArn: adminRole.roleArn,
    });

    this.identityPool = new CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
      identityPoolName: 'users',
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      }],
    });

    const authoenticatedRole = new Role(this, 'AuthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated',
        },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });
    const unauthoenticatedRole = new Role(this, 'UnauthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'unauthenticated',
        },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    new CfnIdentityPoolRoleAttachment(this, 'RoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: authoenticatedRole.roleArn,
        unauthenticated: unauthoenticatedRole.roleArn,
      },
    });
  }
}
