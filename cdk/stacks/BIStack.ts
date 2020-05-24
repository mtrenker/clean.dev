import { Stack, App, StackProps } from '@aws-cdk/core';
import { EventBridgeDestination } from '@aws-cdk/aws-lambda-destinations';
import { EventBus } from '@aws-cdk/aws-events';

export class BIStack extends Stack {
  public readonly eventBridgeDestination: EventBridgeDestination;

  public readonly eventBus: EventBus;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    this.eventBus = new EventBus(this, 'Bus', {
      eventBusName: 'CleanBus',
    });

    this.eventBridgeDestination = new EventBridgeDestination(this.eventBus);
  }
}
