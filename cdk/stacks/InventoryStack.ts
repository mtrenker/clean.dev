import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';

import { Inventory } from '../constructs/Inventory/Inventory';

export class InventoryStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const { eventBus, inventoryTable } = new Inventory(this, 'Inventory', {
      eventBucketName: 'events.clean.dev',
      eventBusName: 'EventBus',
      tableName: 'InventoryTable',
    });

    new CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
      exportName: 'eventBusName',
    });

    new CfnOutput(this, 'InventoryTablename', {
      value: inventoryTable.tableName,
      exportName: 'inventoryTableName',
    });
  }
}
