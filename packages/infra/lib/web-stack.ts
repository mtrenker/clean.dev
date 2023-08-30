import { Stack } from "aws-cdk-lib";
import { CdkNextApp } from "@cleandev/cdk-next-app";
import { Construct } from "constructs";

export interface WebStackProps {
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id);

    new CdkNextApp(this, "CdkNextApp", {

    });
  }
}
