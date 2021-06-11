import { Construct, Stage, StageProps } from '@aws-cdk/core';

import { ApiStack } from '../stacks/ApiStack';
import { AuthStack } from '../stacks/AuthStack';
import { CmsStack } from '../stacks/CmsStack';
import { FrontStack } from '../stacks/FrontStack';
import { InventoryStack } from '../stacks/InventoryStack';

export class Application extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const auth = new AuthStack(this, 'Auth', props);

    const inventory = new InventoryStack(this, 'Inventory', props);

    const api = new ApiStack(this, 'Api', props);
    api.addDependency(auth);
    api.addDependency(inventory);

    const frontend = new FrontStack(this, 'Frontend', props);
    frontend.addDependency(api);

    const cms = new CmsStack(this, 'Cms', props);
    cms.addDependency(api);
  }
}
