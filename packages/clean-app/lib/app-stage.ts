import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InventoryStack } from './inventory-stack';
import { ApiStack } from './api-stack';
import { UserStack } from './user-stack';

export class AppStage extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const inventoryStack = new InventoryStack(this, 'InventoryStack');
    const userStack = new UserStack(this, 'UserStack');
    const apiStack = new ApiStack(this, 'ApiStack');
    apiStack.addDependency(userStack);
    apiStack.addDependency(inventoryStack);
  }
}
