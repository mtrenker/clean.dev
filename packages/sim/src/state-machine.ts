import type { EntityId, System, World } from './ecs';

export type Transition<TState extends string, TContext, TWorld extends World> = {
  from: TState;
  to: TState;
  when: (args: {
    world: TWorld;
    entity: EntityId;
    state: StateMachine<TState, TContext>;
    context: TContext;
    dt: number;
  }) => boolean;
  effect?: (args: {
    world: TWorld;
    entity: EntityId;
    state: StateMachine<TState, TContext>;
    context: TContext;
    dt: number;
  }) => void;
};

export type StateMachine<TState extends string, TContext = unknown> = {
  value: TState;
  previous?: TState;
  elapsed: number;
  context: TContext;
};

export function createStateMachineSystem<
  TState extends string,
  TContext,
  TWorld extends World = World,
>(component: string, transitions: Array<Transition<TState, TContext, TWorld>>): System<TWorld> {
  return (world, dt) => {
    for (const [entity, state] of world.entries<StateMachine<TState, TContext>>(component)) {
      state.elapsed += dt;
      const transition = transitions.find((candidate) => {
        return candidate.from === state.value && candidate.when({
          world,
          entity,
          state,
          context: state.context,
          dt,
        });
      });

      if (!transition) continue;
      transition.effect?.({ world, entity, state, context: state.context, dt });
      state.previous = state.value;
      state.value = transition.to;
      state.elapsed = 0;
    }
  };
}
