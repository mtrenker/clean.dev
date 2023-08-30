import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AppStage } from './app-stage';
import { ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

export interface PipelineStackProps extends StackProps {
  readonly repository: string;
  readonly branch: string;
  readonly packagePath: string;
}

export class PipelineStack extends Stack {
  constructor (scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { repository, branch, env, packagePath } = props;

    const app = new AppStage(this, 'App', {
      env,
    });

    const connectionArn = Secret.fromSecretNameV2(this, 'ConnectionSecret', 'github/connection').secretValue.unsafeUnwrap();

    const pipeline = new CodePipeline(this, 'CodePipeline', {
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
          computeType: ComputeType.MEDIUM,
        },
      },
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(repository, branch, {
          connectionArn,
        }),
        commands: [
          'corepack enable',
          'corepack prepare pnpm@latest-8 --activate',
          'pnpm i',
          'pnpm synth',
        ],
        primaryOutputDirectory: `${packagePath}/cdk.out`
      }),
    });
    pipeline.addStage(app);
  }
}
