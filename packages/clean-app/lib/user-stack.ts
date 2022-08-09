import { CfnOutput, Stack } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class UserStack extends Stack {
  constructor (scope: Construct, id: string) {
    super(scope, id);

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'CleanUserPool',
      selfSignUpEnabled: false,
      signInAliases: {
        username: false,
        email: true,
      },
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      exportName: 'UserPoolId',
    });
  }
}
