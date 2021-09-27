import { animationFrames } from 'rxjs';
import {
  ActorRef, assign, createMachine, spawn,
} from 'xstate';
import {
  physicsSystem, graphicsSystem, inputSystem,
} from './systemMachine';

interface Component {
  name: string;
  data?: {
    [key: string]: string | number | boolean;
  }
}

export interface Entity {
  id: string;
  components: Component[];
}

interface EcsContext {
  ctx?: CanvasRenderingContext2D;
  entities: Entity[];
  systems: ActorRef<EcsEvent>[];
  ticks: number;
}

export type Vector2D = [number, number];

export type EcsEvent =
  | { type: 'STOP'}
  | { type: 'CLICK', position: Vector2D, entities?: Entity[] }
  | { type: 'TICK', timestamp: number, elapsed: number, entities?: Entity[] }
  | { type: 'SETUP', ctx: CanvasRenderingContext2D }
  | { type: 'ADD_ENTITY', entity: Entity }
  | { type: 'REMOVE_ENTITY', entity: Entity }
  | { type: 'ADD_COMPONENT', entity: Entity, component: Component }
  | { type: 'REMOVE_COMPONENT', entity: Entity, component: Component }

export const ecsMachine = createMachine<EcsContext, EcsEvent>({
  id: 'ecs',
  initial: 'idle',
  context: {
    entities: [],
    systems: [],
    ticks: 0,
  },
  on: {
    STOP: 'idle',
    CLICK: {
      actions: ['click'],
    },
    ADD_ENTITY: {
      actions: ['addEntity'],
    },
    ADD_COMPONENT: {
      actions: ['addComponent'],
    },
    REMOVE_COMPONENT: {
      actions: ['removeComponent'],
    },
  },
  states: {
    idle: {
      on: {
        SETUP: {
          actions: ['setup'],
          target: 'playing',
        },
      },
    },
    playing: {
      invoke: {
        src: 'loop',
      },
      on: {
        TICK: {
          actions: ['tick', 'increaseTickCount'],
        },
      },
    },
    paused: {},
  },
}, {
  actions: {
    addEntity: assign({
      entities: (ctx, event) => {
        if (event.type === 'ADD_ENTITY') {
          return [...ctx.entities, event.entity];
        }
        return ctx.entities;
      },
    }),
    setup: assign({
      ctx: (_, event) => {
        if (event.type === 'SETUP') {
          return event.ctx;
        }
        throw new Error('Wrong Event');
      },
      systems: (_, { ctx }) => {
        if (!ctx) {
          throw new Error('Context not found');
        }
        return [
          spawn(inputSystem.withContext({ ctx })),
          spawn(graphicsSystem.withContext({ ctx })),
          spawn(physicsSystem.withContext({ interval: 100, ctx })),
        ];
      },
    }),
    increaseTickCount: assign({
      ticks: (ctx) => ctx.ticks + 1,
    }),
    tick: (context, event) => {
      const { entities, systems, ctx } = context;
      if (event.type === 'TICK') {
        systems.forEach((system) => system.send({ ...event, entities }));
      }
    },
    click: (context, event) => {
      const { systems, entities } = context;
      if (event.type === 'CLICK') {
        const { position } = event;
        systems.forEach((system) => system.send({ type: 'CLICK', position, entities }));
      }
    },
    log: (context, event) => { console.log(context, event); },
    addComponent: assign({
      entities: ({ entities }, event) => entities.map((entity) => {
        if (event.type === 'ADD_COMPONENT') {
          if (entity.id === event.entity.id) {
            return {
              ...entity,
              components: [
                ...entity.components.filter((component) => component.name !== event.component.name),
                event.component],
            };
          }
        }
        return entity;
      }),
    }),
    removeComponent: assign({
      entities: ({ entities }, event) => entities.map((entity) => {
        if (event.type === 'REMOVE_COMPONENT') {
          if (entity.id === event.entity.id) {
            return {
              ...entity,
              components: [...entity.components.filter((component) => component.name !== event.component.name)],
            };
          }
        }
        return entity;
      }),
    }),
  },
  services: {
    loop: () => (send) => {
      const subsciption = animationFrames().pipe(
        
      ).subscribe(({ elapsed, timestamp }) => {
        send({ type: 'TICK', elapsed, timestamp });
      });
      return () => {
        subsciption.unsubscribe();
      };
    },
  },
});
