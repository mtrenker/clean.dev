import { Construct } from '@aws-cdk/core';
import {
  CfnUserPoolGroup,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
} from '@aws-cdk/aws-cognito';
import { FederatedPrincipal, Role } from '@aws-cdk/aws-iam';

interface UserProps {
  domain: string;
}

export class Users extends Construct {
  public readonly userPool: UserPool;

  public readonly identityPool: CfnIdentityPool;

  public readonly userPoolClient: UserPoolClient;

  public readonly authenticatedUserRole: Role;

  public readonly unauthenticatedUserRole: Role;

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

    this.identityPool = new CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: 'UserIdentities',
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      }],
    });

    const identityPoolId = this.identityPool.ref;

    this.authenticatedUserRole = new Role(this, 'AuthenticatedUserRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPoolId },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    this.unauthenticatedUserRole = new Role(this, 'UnauthenticatedUserRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPoolId },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoles', {
      identityPoolId,
      roles: {
        unauthenticated: this.unauthenticatedUserRole.roleArn,
        authenticated: this.authenticatedUserRole.roleArn,
      },
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admins',
    });
  }
}
