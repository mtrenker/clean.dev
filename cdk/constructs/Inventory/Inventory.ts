import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { EventBus, CfnRule } from '@aws-cdk/aws-events';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  Role, ServicePrincipal, PolicyStatement, Effect, PolicyDocument,
} from '@aws-cdk/aws-iam';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

interface InventoryProps {
  eventBucketName: string;
  eventBusName: string;
  tableName: string;
}

export class Inventory extends Construct {
  public inventoryTable: Table;

  public eventBus: EventBus;

  public deliveryStream: CfnDeliveryStream;

  constructor(scope: Construct, id: string, props: InventoryProps) {
    super(scope, id);

    const { eventBusName, eventBucketName, tableName } = props;

    this.eventBus = new EventBus(this, 'EventBus', {
      eventBusName,
    });

    const eventBucket = new Bucket(this, 'EventBucket', {
      bucketName: eventBucketName,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const firehoseRole = new Role(this, 'FirehoseRole', {
      assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
    });

    eventBucket.grantReadWrite(firehoseRole);

    this.deliveryStream = new CfnDeliveryStream(this, 'EventDeliveryStream', {
      deliveryStreamName: 'EventStream',
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

    this.inventoryTable = new Table(this, 'Inventory', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName,
    });

    this.addListener(this.deliveryStream);
  }

  private addListener(deliveryStream: CfnDeliveryStream) {
    const ruleRole = new Role(this, 'RuleRole', {
      assumedBy: new ServicePrincipal('events.amazonaws.com'),
      inlinePolicies: {
        writeToStream: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'firehose:DeleteDeliveryStream',
                'firehose:PutRecord',
                'firehose:PutRecordBatch',
                'firehose:UpdateDestination',
              ],
              effect: Effect.ALLOW,
              resources: [deliveryStream.attrArn],
            }),
          ],
        }),
      },
    });

    const rule = new CfnRule(this, 'DeliveryRule', {
      description: 'Delivery stream for inventory table',
      eventBusName: this.eventBus.eventBusName,
      eventPattern: {
        source: [
          '*',
        ],
      },
      targets: [{
        id: 'CatchAll',
        arn: deliveryStream.attrArn,
        roleArn: ruleRole.roleArn,
      }],
    });
    return rule;
  }
}
