import { Stack, App, StackProps } from '@aws-cdk/core';

export class BIStack extends Stack {
  public readonly eventBridgeDestination: EventB

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const eventBridge = 'foo';
  }
}
