import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';
import {
  UserPool, OAuthScope, CfnUserPoolGroup, UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import { StringParameter } from '@aws-cdk/aws-ssm';

export class AuthStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'users',
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

    const env = this.node.tryGetContext('env');

    const site = env === 'prod' ? 'https://clean.dev' : `https://${env}.clean.dev`;

    const userPoolClient = userPool.addClient('Client', {
      userPoolClientName: 'userpool',
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: [site],
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    });

    // commented out comment is waiting for https://github.com/aws/aws-cdk/pull/8622
    // currently, the UserPoolDomainTarget has problems with duplicate node ids

    userPool.addDomain('Domain', {
      // customDomain: {
      //   certificate: Certificate.fromCertificateArn(this, 'Cert', Fn.importValue('CertificateArn')),
      //   domainName: 'auth.clean.dev',
      // },
      cognitoDomain: {
        domainPrefix: 'clean-auth',
      },
    });

    // const hostedZone = HostedZone.fromLookup(this, 'Zone', {
    //   domainName: 'clean.dev',
    // });

    // const recordProps: ARecordProps | AaaaRecordProps = {
    //   target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
    //   zone: hostedZone,
    // };

    // new ARecord(this, 'ARecord', recordProps);
    // new AaaaRecord(this, 'AaaaRecord', recordProps);

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admins',
    });

    new StringParameter(this, 'UserPoolIdParam', {
      stringValue: userPool.userPoolId,
      parameterName: 'userPoolId',
    });

    new StringParameter(this, 'UserPoolClientIdParam', {
      stringValue: userPoolClient.userPoolClientId,
      parameterName: 'userPoolClientId',
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
