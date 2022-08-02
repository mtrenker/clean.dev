import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CleanProjects } from "../../clean-projects/lib";

export class ApiStack extends Stack {
  constructor (scope: Construct, id: string) {
    super(scope, id);

    new CleanProjects(this, 'CleanProjects', {});
  }
}
