import { createMachine } from 'xstate';

export const serverlessAnimationMachine = createMachine({
  id: 'serverless-animation',
  initial: 'setup',
  context: {},
  states: {
    setup: {
      on: {
        TYPE: 'type',
      },
    },
    start: {
      on: {
        TYPE: 'type',
        DRAW: 'draw',
      },
    },
    type: {
      invoke: {
        src: 'typeLine',
        onDone: 'start',
        onError: 'start',
      },
    },
    draw: {
      invoke: {
        src: 'draw',
        onDone: 'start',
        onError: 'start',
      },
    },
    done: {},
  },
});
