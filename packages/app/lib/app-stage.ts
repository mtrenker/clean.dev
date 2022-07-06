import { RemovalPolicy, Stage, StageProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { InventoryStack } from './inventory-stack';

export class AppStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new InventoryStack(this, 'InventoryStack')
  }
}
