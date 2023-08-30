import { Stack } from "aws-cdk-lib";
import { NextApp } from "@cleandev/cdk-next-app";
import { Construct } from "constructs";

export interface WebStackProps {
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id);

    new NextApp(this, "CdkNextApp", {

    });
  }
}
