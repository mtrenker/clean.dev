import { Stack, StackProps } from "aws-cdk-lib";
import { Dashboard } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";

export interface MonitoringStackProps extends StackProps {
}

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props?: MonitoringStackProps) {
    super(scope, id, props);
    new Dashboard(this, "Dashboard");
  }
}
