import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

interface InventoryProps {
  tableName: string;
}

export class Inventory extends Construct {
  public inventoryTable: Table;

  constructor(scope: Construct, id: string, props: InventoryProps) {
    super(scope, id);

    const { tableName } = props;

    this.inventoryTable = new Table(this, 'Inventory', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName,
    });
  }
}
