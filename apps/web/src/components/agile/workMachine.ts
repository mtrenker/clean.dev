import { filter } from 'd3';
import { add } from 'date-fns';
import { createMachine, assign, setup, fromCallback } from 'xstate';

export interface Task {
  id: string;
  type: 'story' | 'bug';
  age: number;
  complexity?: number;
  title: string;
  completed: boolean;
  lane?: string;
}

export interface Developer {
  id: string;
  name: string;
}

export interface Lane {
  id: string;
  title: string;
}

export interface WorkContext {
  tasks: Task[];
  lanes: Lane[];
  hours: number;
}

export type WorkEvent  = {
  type: 'ADD_TASK';
  task: Task;
} | {
  type: 'REMOVE_TASK';
  taskId: string;
} | {
  type: 'CLEAR_TASKS';
} | {
  type: 'TICK';
} | {
  type: 'START';
} | {
  type: 'STOP';
} | {
  type: 'ADD_LANE';
  lane: Lane;
} | {
  type: 'REMOVE_LANE';
  laneId: string;
}

export const workMachine = setup({
  actors: {
    ticks: fromCallback(({sendBack}) => {
      const interval = setInterval(() => {
        sendBack({type: 'TICK'});
      }, 500);

      return () => {
        clearInterval(interval);
      };

    })
  },
  types: {
    context: {} as WorkContext,
    events: {} as WorkEvent,
  },
  actions: {
    addTask: assign({
      tasks: ({ context, event }) => {
        if (event.type === 'ADD_TASK') {
          return context.tasks.concat(event.task);
        }
        return context.tasks;
      },
    }),
    removeTask: assign({
      tasks: ({ context, event }) => {
        if (event.type === 'REMOVE_TASK') {
          return context.tasks.filter(t => t.id !== event.taskId);
        }
        return context.tasks;
      }
    }),
    clearTasks: assign({
      tasks: []
    }),
    addLane: assign({
      lanes: ({ context, event }) => {
        if (event.type === 'ADD_LANE') {
          return context.lanes.concat(event.lane);
        }
        return context.lanes;
      }
    }),
    removeLane: assign({
      lanes: ({ context, event }) => {
        if (event.type === 'REMOVE_LANE') {
          return context.lanes.filter(l => l.id !== event.laneId);
        }
        return context.lanes;
      }
    }),
  }
}).createMachine({
  id: 'workflow',
  context: {
    tasks: [],
    lanes: [],
    hours: 0
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'active',
      }
    },
    active: {
      invoke: {
        src: 'ticks'
      },
      on: {
        STOP: 'idle',
        TICK: {
          actions: assign({
            hours: ({ context }) => context.hours + 1,
            tasks: ({ context }) => {
              const type = Math.random() > 0.5 ? 'story' : 'bug';
              const title = type === 'story' ? 'New Story' : 'New Bug';
              const id = (Math.random() * 100).toString(36);
              const task: Task = {
                id,
                type,
                age: 0,
                completed: false,
                title
              };
              const mapppedTasks = context.tasks
                .filter(t => t.age < 10)
                .map(t => {
                  return {
                    ...t,
                    age: t.age + 1
                  };
                });
              return mapppedTasks.concat(task);
            }
          }),
        }
      }
    }
  },
  on: {
    CLEAR_TASKS: {
      actions: 'clearTasks'
    },
    ADD_TASK: {
      actions: 'addTask'
    },
    REMOVE_TASK: {
      actions: 'removeTask'
    },
    ADD_LANE: {
      actions: 'addLane'
    },
    REMOVE_LANE: {
      actions: 'removeLane'
    }
  }
});
