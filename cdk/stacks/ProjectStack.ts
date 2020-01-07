import { Stack, StackProps, App } from "@aws-cdk/core";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";

export class ProjectStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, "Projects", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING
      }
    })
  }
}
