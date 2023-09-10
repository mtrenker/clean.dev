import type { PlopTypes } from '@turbo/gen';

// eslint-disable-next-line import/no-default-export -- Plop requires default export
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('cdk-stack', {
    description: 'Boilerplate for a new CDK Stack',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'What is the name of the new Stack?',
    }],
    actions: [{
      type: 'add',
      path: 'lib/{{name}}-stack.ts',
      templateFile: 'templates/cdk-stack.ts.t',
    }],
  });
}
