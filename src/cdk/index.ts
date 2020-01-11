import { App, Stack, Construct, StackProps } from "@aws-cdk/core";
import { ProjectStack } from "./stacks/ProjectStack";

const app = new App();

new ProjectStack(app, "ProjectStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

app.synth();
