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
    const { name } = this.args;
    const { type = 'layout' } = this.options;


    this.templates().forEach((file) => file.saveAs(`src/components/${type}/`, name));
  }
}
