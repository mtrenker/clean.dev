import { App, Stack, Construct, StackProps } from "@aws-cdk/core";
import { ProjectStack } from "./stacks/ProjectStack";

const app = new App();

new ProjectStack(app, "ProjectStack");

app.synth();
