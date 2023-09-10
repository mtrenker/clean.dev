import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Dashboard } from 'aws-cdk-lib/aws-cloudwatch';
import type { Construct } from 'constructs';

export type MonitoringStackProps = StackProps

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props?: MonitoringStackProps) {
    super(scope, id, props);
    new Dashboard(this, 'Dashboard');
  }
}
