import { Stack, App, StackProps } from '@aws-cdk/core';
import {
  UserPool, IUserPool,
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

    this.userPool = userPool;
  }
}
