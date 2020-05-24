import { Stack, App, StackProps } from '@aws-cdk/core';
import { EventBus } from '@aws-cdk/aws-events';
import { CfnDeliveryStream } from '@aws-cdk/aws-kinesisfirehose';
import { Bucket } from '@aws-cdk/aws-s3';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';

export class BIStack extends Stack {
  public readonly eventBus: EventBus;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    this.eventBus = new EventBus(this, 'Bus', {
      eventBusName: 'CleanBus',
    });

    const eventBucket = new Bucket(this, 'EventBucket');

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
  }
}
