import { Construct, Fn } from '@aws-cdk/core';
import {
  CfnUserPoolGroup, OAuthScope, StringAttribute, UserPool, UserPoolClient, UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Table } from '@aws-cdk/aws-dynamodb';
import {
  ManagedPolicy, PolicyStatement, Role, ServicePrincipal,
} from '@aws-cdk/aws-iam';

interface UserProps {
  domain: string;
}

export class Users extends Construct {
  public userPool: UserPool;

  public userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: UserProps) {
    super(scope, id);

    const { domain } = props;

    const tableName = Fn.importValue('inventoryTableName');
    const table = Table.fromTableName(this, 'Table', tableName);

    const postConfirmationRole = new Role(this, 'PostConfirmationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const postConfirmation = new NodejsFunction(this, 'post-confirmation', {
      environment: {
        INVENTORY_TABLE_NAME: tableName,
      },
      role: postConfirmationRole,
    });

    table.grantWriteData(postConfirmation);

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'users',
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
      autoVerify: {
        email: true,
        phone: false,
      },
      lambdaTriggers: {
        postConfirmation,
      },
      customAttributes: {
        userId: new StringAttribute(), // TODO: remove me once safe
        user: new StringAttribute({ mutable: true }),
      },
    });

    postConfirmationRole.addToPolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['cognito-idp:AdminUpdateUserAttributes'],
    }));

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

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admins',
    });
  }
}
