import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InventoryStack } from './inventory-stack';
import { ApiStack } from './api-stack';

export class AppStage extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const inventoryStack = new InventoryStack(this, 'InventoryStack');
    const apiStack = new ApiStack(this, 'ApiStack');
    apiStack.addDependency(inventoryStack);
  }
}
