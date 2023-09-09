import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface {{ pascalCase name }}StackProps extends StackProps {
}

export class {{ pascalCase name }}Stack extends Stack {
  constructor(scope: Construct, id: string, props: {{ pascalCase name }}StackProps) {
    super(scope, id, props);
  }
}
