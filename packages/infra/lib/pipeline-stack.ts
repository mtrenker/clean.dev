import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

import { AppStage } from './app-stage';

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
      publishAssetsInParallel: false,
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
        env: {
          BLOG_ENDPOINT: StringParameter.valueForStringParameter(this, '/clean/blog/api-endpoint'),
        },
        commands: [
          'corepack enable',
          'corepack prepare pnpm@latest-8 --activate',
          'pnpm i',
          'pnpm build:open',
          'pnpm synth',
        ],
        primaryOutputDirectory: `${packagePath}/cdk.out`
      }),
    });
    pipeline.addStage(app);
  }
}
