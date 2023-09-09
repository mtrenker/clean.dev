import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("cdk-stack", {
    description: "Boilerplate for a new CDK Stack",
    prompts: [{
      type: "input",
      name: "name",
      message: "What is the name of the new Stack?",
    }],
    actions: [{
      type: "add",
      path: "lib/{{name}}-stack.ts",
      templateFile: "templates/cdk-stack.ts.t",
    }],
  });
}
