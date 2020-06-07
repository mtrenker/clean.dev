import { Generator } from 'battlecry';

export default class ComponentGenerator extends Generator {
  config = {
    generate: {
      args: 'name',
      description: 'generates a new react component and all its boilerplate',
      options: {
        type: {
          arg: 'required',
          description: 'type of component',
        },
      },
    },
  };

  generate() {
    const { name, type = 'layout' } = this.args;
    this.templates().forEach((file) => file.saveAs(`src/components/${type}/`, name));
  }
}
