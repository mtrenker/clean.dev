import {
  Stack, App, StackProps, CfnOutput,
} from '@aws-cdk/core';
import { MainBus } from '../constructs/DataLake/MainBus';

import { Inventory } from '../constructs/Inventory/Inventory';

export class InventoryStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const { inventoryTable } = new Inventory(this, 'Inventory', {
      tableName: 'InventoryTable',
    });

    const { eventBus } = new MainBus(this, 'MainBus', {
      eventBucketName: 'events.clean.dev',
      eventBusName: 'EventBus',
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
