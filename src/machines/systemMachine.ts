import { createMachine } from 'xstate';
import { pure, respond, send } from 'xstate/lib/actions';
import { EcsEvent, Entity } from './ecsMachine';

export interface SystemContext {
  interval?: number;
  ctx?: CanvasRenderingContext2D;
}

type SystemEvent = EcsEvent;

export const createSystem = (id: string) => createMachine<SystemContext, SystemEvent>({
  id,
  initial: 'idle',
  context: {
    interval: 1000,
  },
  on: {
    CLICK: {
      actions: ['click'],
    },
  },
  states: {
    idle: {
      on: {
        TICK: {
          target: 'updating',
          cond: ({ interval }, event) => {
            if (interval) {
              return event.elapsed % interval < 10;
            }
            return true;
          },
        },
      },
    },
    updating: {
      entry: 'update',
      on: {
        TICK: 'idle',
      },
    },
  },
}, {
  actions: {
    update: () => {},
    click: () => {},
  },
});

export const graphicsSystem = createSystem('graphics').withConfig({
  actions: {
    update: (context, event) => {
      if (event.type === 'TICK') {
        const { ctx } = context;
        const {
          elapsed, timestamp, type, entities,
        } = event;
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        entities?.forEach((entity) => {
          const data = mergeComponents(entity);
          const { iconSrc } = data.get('icon');
          const { x, y } = data.get('position');
          const image = new Image();
          image.src = iconSrc;

          ctx?.drawImage(image, x, y);
          if (data.has('selected')) {
            ctx?.fillText('Selected', x, y + 50);
          }
        });
      }
    },
  },
});

export const physicsSystem = createSystem('physics').withConfig({
  actions: {
    update: pure((context, event) => {
      const events: any[] = [];
      if (event.type === 'TICK') {
        const { entities, elapsed } = event;
        entities?.forEach((entity) => {
          const data = mergeComponents(entity);
          if (data.has('move')) {
            const { to } = data.get('move');
            const { x, y } = data.get('position');
            const [toX, toY] = to;
            const dx = toX - x;
            const dy = toY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (data.has('velocity')) {
              const { x: vx, y: vy } = data.get('velocity');
              if (x === toX && vx > 0) {
                events.push(send({
                  type: 'ADD_COMPONENT',
                  entity,
                  component: {
                    name: 'velocity',
                    data: {
                      x: 0,
                      y: vy,
                    },
                  },
                }, { to: 'ecs' }));
                return;
              }
              if (y === toY && vy > 0) {
                events.push(send({
                  type: 'ADD_COMPONENT',
                  entity,
                  component: {
                    name: 'velocity',
                    data: {
                      x: vx,
                      y: 0,
                    },
                  },
                }, { to: 'ecs' }));
                return;
              }
              events.push(send({
                type: 'ADD_COMPONENT',
                entity,
                component: {
                  name: 'position',
                  data: {
                    x: x + vx,
                    y: y + vy,
                  },
                },
              }, { to: 'ecs' }));
            } else {
              events.push(send({
                type: 'ADD_COMPONENT',
                entity,
                component: {
                  name: 'velocity',
                  data: {
                    x: 1,
                    y: 1,
                  },
                },
              }, { to: 'ecs' }));
            }
          }
        });
      }
      return events;
    }),
  },
});

export const inputSystem = createSystem('input').withConfig({
  actions: {
    update: (context, event) => {},
    click: pure((context, event) => {
      const events: any[] = [];
      if (event.type === 'CLICK') {
        const { entities } = event;
        entities?.forEach((entity) => {
          const data = mergeComponents(entity);
          const { x, y } = data.get('position');
          const [mx, my] = event.position;
          if (
            x < mx
            && x + 48 > mx
            && y < my
            && y + 48 > my
          ) {
            if (data.has('selected')) {
              const changeEvent = send({
                type: 'REMOVE_COMPONENT',
                entity,
                component: {
                  name: 'selected',
                },
              }, { to: 'ecs' });
              events.push(changeEvent);
            } else {
              const changeEvent = send({
                type: 'ADD_COMPONENT',
                entity,
                component: {
                  name: 'selected',
                },
              }, { to: 'ecs' });
              events.push(changeEvent);
            }
          }
        });
      }
      return events;
    }),
  },
});

const mergeComponents = (entity: Entity) => entity.components.reduce<Map<string, any>>(
  (prev, cur) => prev.set(cur.name, cur.data), new Map(),
);
