import {
  Stack, App, StackProps, RemovalPolicy,
} from '@aws-cdk/core';
import { EventBus } from '@aws-cdk/aws-events';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { Bucket } from '@aws-cdk/aws-s3';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { StringParameter } from '@aws-cdk/aws-ssm';

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

    new StringParameter(this, 'cleanDevEventBusName', {
      stringValue: eventBus.eventBusName,
      parameterName: 'cleanDevEventBusName',
    });

    new StringParameter(this, 'cleanDevInventoryName', {
      stringValue: inventory.tableName,
      parameterName: 'cleanDevInventoryName',
    });
  }
}
