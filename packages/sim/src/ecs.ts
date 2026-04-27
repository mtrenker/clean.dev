export type EntityId = number;
export type ComponentStore<T> = Map<EntityId, T>;
export type System<TWorld extends World = World> = (world: TWorld, dt: number) => void;

export class World {
  private nextEntityId = 1;
  private readonly components = new Map<string, ComponentStore<unknown>>();
  private readonly systems: System<this>[] = [];
  time = 0;

  createEntity(): EntityId {
    return this.nextEntityId++;
  }

  add<T>(entity: EntityId, component: string, value: T): T {
    this.store<T>(component).set(entity, value);
    return value;
  }

  get<T>(entity: EntityId, component: string): T | undefined {
    return this.store<T>(component).get(entity);
  }

  require<T>(entity: EntityId, component: string): T {
    const value = this.get<T>(entity, component);
    if (value === undefined) {
      throw new Error(`Entity ${entity} is missing component ${component}`);
    }
    return value;
  }

  remove(entity: EntityId, component: string): void {
    this.store(component).delete(entity);
  }

  entitiesWith(...componentNames: string[]): EntityId[] {
    if (componentNames.length === 0) return [];
    const [first, ...rest] = componentNames;
    const firstStore = this.store(first);
    const result: EntityId[] = [];

    for (const entity of firstStore.keys()) {
      if (rest.every((name) => this.store(name).has(entity))) {
        result.push(entity);
      }
    }

    return result;
  }

  entries<T>(component: string): Array<[EntityId, T]> {
    return Array.from(this.store<T>(component).entries());
  }

  addSystem(system: System<this>): this {
    this.systems.push(system);
    return this;
  }

  step(dt: number): void {
    this.time += dt;
    for (const system of this.systems) system(this, dt);
  }

  private store<T = unknown>(component: string): ComponentStore<T> {
    let store = this.components.get(component) as ComponentStore<T> | undefined;
    if (!store) {
      store = new Map<EntityId, T>();
      this.components.set(component, store as ComponentStore<unknown>);
    }
    return store;
  }
}
