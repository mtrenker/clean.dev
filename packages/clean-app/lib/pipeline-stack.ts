import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AppStage } from './app-stage';

export class PipelineStack extends Stack {
  constructor (scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const app = new AppStage(this, 'AppStage', props);

    const repository = 'mtrenker/clean.dev';
    const branch = 'main';
    const connectionArn = Secret.fromSecretNameV2(this, 'ConnectionSecret', 'github/connection').secretValue.unsafeUnwrap();

    const pipeline = new CodePipeline(this, 'Pipeline', {
      codeBuildDefaults: {

      },
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(repository, branch, {
          connectionArn,
        }),
        commands: [
          'npm i -g npm@8.4',
          'node -v',
          'npm -v',
          'npm ci',
          'npm run synth',
        ],
        primaryOutputDirectory: 'packages/clean-app/cdk.out',
      }),
    });

    pipeline.addStage(app);
  }
}
