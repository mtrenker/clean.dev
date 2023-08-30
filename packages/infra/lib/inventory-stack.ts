import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class InventoryStack extends Stack {
  table: Table;
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'InventoryTable', {
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

    new CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      exportName: 'InventoryTableName',
    });
  }
}
