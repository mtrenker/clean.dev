import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebStack } from './web-stack';

export class AppStage extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new WebStack(this, 'WebStack', {});
  }
}
