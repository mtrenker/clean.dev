import { Stack, StackProps, App } from "@aws-cdk/core";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { Function, Code, Runtime } from "@aws-cdk/aws-lambda";
import { Role, ServicePrincipal, ManagedPolicy } from "@aws-cdk/aws-iam";

export class ProjectStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const projectsTable = new Table(this, "Projects", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING
      }
    });

    const projectUpdaterRole = new Role(this, "UpdaterRole", {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });

    projectsTable.grantReadWriteData(projectUpdaterRole);

    const projectUpdaterFunction = new Function(this, "ImportFunction", {
      code: Code.asset('./../lambda/projectUpdater'),
      handler: "projectUpdater.handler",
      runtime: Runtime.NODEJS_12_X,
      role: projectUpdaterRole
    });
  }
}
