import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InventoryStack } from './inventory-stack';
import { CleanProjects } from "../../clean-projects/lib/index";

export class AppStage extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new InventoryStack(this, 'InventoryStack');
    new CleanProjects(this, 'CleanProjects', {});
  }
}
