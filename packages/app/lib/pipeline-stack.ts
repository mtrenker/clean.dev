import { Stack, StackProps } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const repositry = 'mtrenker/clean.dev';
    const branch = 'next';
    const connectionArn = Secret.fromSecretNameV2(this, 'ConnectionSecret', 'github/connection').secretValue.unsafeUnwrap();

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(repositry, branch, {
          connectionArn,
        }),
        commands: [
          'npm ci',
          'cd ./packages/app',
          'npx cdk synth',
        ],
      }),
    })
  }
}
