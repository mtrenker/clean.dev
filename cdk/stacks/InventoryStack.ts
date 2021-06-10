import {
  Stack, StackProps, CfnOutput, Construct,
} from '@aws-cdk/core';

import { Inventory } from '../constructs/Inventory/Inventory';

export class InventoryStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { inventoryTable } = new Inventory(this, 'Inventory');

    new CfnOutput(this, 'InventoryTablename', {
      value: inventoryTable.tableName,
      exportName: 'inventoryTableName',
    });
  }
}
