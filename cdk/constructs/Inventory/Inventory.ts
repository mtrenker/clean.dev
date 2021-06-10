import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

export class Inventory extends Construct {
  public inventoryTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

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
    });

    this.inventoryTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'data',
        type: AttributeType.STRING,
      },
    });
  }
}
