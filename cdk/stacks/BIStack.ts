import {
  Stack, App, StackProps, RemovalPolicy, CfnParameter, CfnOutput,
} from '@aws-cdk/core';
import { EventBus } from '@aws-cdk/aws-events';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { Bucket } from '@aws-cdk/aws-s3';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

export class BIStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventBus = new EventBus(this, 'Bus', {
      eventBusName: 'CleanBus',
    });

    const eventBucket = new Bucket(this, 'EventBucket', {
      bucketName: 'prod.events.clean.dev',
    });

    const firehoseRole = new Role(this, 'FirehoseRole', {
      assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
    });

    eventBucket.grantReadWrite(firehoseRole);

    new CfnDeliveryStream(this, 'EventDeliveryStream', {
      deliveryStreamType: 'DirectPut',
      s3DestinationConfiguration: {
        bucketArn: eventBucket.bucketArn,
        bufferingHints: {
          sizeInMBs: 5,
          intervalInSeconds: 300,
        },
        compressionFormat: 'GZIP',
        roleArn: firehoseRole.roleArn,
      },
    });

    const inventory = new Table(this, 'Inventory', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName: 'prod.inventory.clean.dev',
    });

    new CfnOutput(this, 'EventBusArn', {
      value: eventBus.eventBusArn,
      exportName: 'eventBusArn',
    });

    new CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
      exportName: 'eventBusName',
    });

    new CfnOutput(this, 'InventoryTablename', {
      value: inventory.tableName,
      exportName: 'inventoryTableName',
    });
  }
}
