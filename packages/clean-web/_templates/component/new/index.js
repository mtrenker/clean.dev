module.exports = {
  prompt: ({ prompter, args }) => prompter.prompt({
    type: 'select',
    name: 'type',
    message: "What type of component do you want to create?",
    choices: [
      { name: 'Common Component', value: 'common' },
      { name: 'Feature Component', value: 'feature' },
    ],
  })
  .then(({ type }) => {
    console.log(type);
    if (type === 'Feature Component') {
      prompter.prompt({
        type: 'input',
        name: 'feature',
        message: `What is the name of the feature?`,
      }).then(({ feature }) => {
        return { type, feature };
      });
    }
  }),
};
