import { World, type EntityId } from './ecs';
import { createStateMachineSystem, type StateMachine } from './state-machine';

export const C = {
  transform: 'transform',
  service: 'service',
  queue: 'queue',
  route: 'route',
  viewport: 'viewport',
} as const;

export type Transform = { x: number; y: number; radius: number; pulse: number };
export type ServiceState = 'healthy' | 'degraded' | 'down';
export type Service = {
  name: string;
  capacityPerSecond: number;
  failureRate: number;
  recoverySeconds: number;
  processed: number;
  dropped: number;
};
export type ServiceMachine = StateMachine<ServiceState, { outageSeconds: number }>;
export type Queue = { name: string; from: EntityId; to: EntityId; depth: number; capacity: number; ratePerSecond: number; dropped: number };
export type Route = { from: EntityId; to: EntityId; label: string };
export type Viewport = { zoom: number; offsetX: number; offsetY: number };

export type MicroserviceParams = {
  trafficMultiplier: number;
  failureMultiplier: number;
  asyncDelayMultiplier: number;
};

export type RenderNode = { id: EntityId; label: string; x: number; y: number; radius: number; state: ServiceState; processed: number; dropped: number; pulse: number };
export type RenderEdge = { from: EntityId; to: EntityId; label: string; depth: number; capacity: number; dropped: number };
export type SimulationSnapshot = { time: number; nodes: RenderNode[]; edges: RenderEdge[]; viewport: Viewport };

export class SeededRandom {
  constructor(private seed = 0x2f6e2b1) {}
  next(): number {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }
}

export class MicroserviceWorld extends World {
  readonly random = new SeededRandom();
  params: MicroserviceParams = {
    trafficMultiplier: 1,
    failureMultiplier: 1,
    asyncDelayMultiplier: 1,
  };
}

export function createMicroserviceScenario(): MicroserviceWorld {
  const world = new MicroserviceWorld();
  const api = service(world, 'API Gateway', 0, -130, 120, 0.004, 8);
  const orders = service(world, 'Orders', -190, 10, 70, 0.006, 10);
  const payments = service(world, 'Payments', 0, 80, 42, 0.012, 12);
  const inventory = service(world, 'Inventory', 190, 10, 54, 0.008, 9);
  const email = service(world, 'Email Worker', 0, 230, 24, 0.01, 7);

  queue(world, 'requests', api, orders, 140, 44);
  queue(world, 'reserve stock', orders, inventory, 90, 28);
  queue(world, 'charge card', orders, payments, 75, 22);
  queue(world, 'receipts', payments, email, 120, 18);
  queue(world, 'shipment notice', inventory, email, 100, 16);

  world.add(world.createEntity(), C.viewport, { zoom: 1, offsetX: 0, offsetY: 0 } satisfies Viewport);
  world
    .addSystem(serviceHealthSystem())
    .addSystem(messageIngressSystem())
    .addSystem(queueDeliverySystem())
    .addSystem(pulseDecaySystem());

  return world;
}

function service(world: MicroserviceWorld, name: string, x: number, y: number, capacityPerSecond: number, failureRate: number, recoverySeconds: number): EntityId {
  const entity = world.createEntity();
  world.add(entity, C.transform, { x, y, radius: 42, pulse: 0 } satisfies Transform);
  world.add(entity, C.service, { name, capacityPerSecond, failureRate, recoverySeconds, processed: 0, dropped: 0 } satisfies Service);
  world.add(entity, 'serviceState', { value: 'healthy', elapsed: 0, context: { outageSeconds: 0 } } satisfies ServiceMachine);
  return entity;
}

function queue(world: MicroserviceWorld, name: string, from: EntityId, to: EntityId, capacity: number, ratePerSecond: number): EntityId {
  const entity = world.createEntity();
  world.add(entity, C.queue, { name, from, to, depth: 0, capacity, ratePerSecond, dropped: 0 } satisfies Queue);
  world.add(entity, C.route, { from, to, label: name } satisfies Route);
  return entity;
}

function serviceHealthSystem() {
  return createStateMachineSystem<ServiceState, { outageSeconds: number }, MicroserviceWorld>('serviceState', [
    {
      from: 'healthy',
      to: 'down',
      when: ({ world, entity, dt }) => {
        const serviceData = world.require<Service>(entity, C.service);
        return world.random.next() < serviceData.failureRate * world.params.failureMultiplier * dt;
      },
      effect: ({ world, entity, context }) => {
        const serviceData = world.require<Service>(entity, C.service);
        context.outageSeconds = serviceData.recoverySeconds * (0.75 + world.random.next() * 0.75);
      },
    },
    {
      from: 'down',
      to: 'degraded',
      when: ({ state, context }) => state.elapsed >= context.outageSeconds,
    },
    {
      from: 'degraded',
      to: 'healthy',
      when: ({ state }) => state.elapsed >= 4,
    },
  ]);
}

function messageIngressSystem() {
  return (world: MicroserviceWorld, dt: number) => {
    for (const [, q] of world.entries<Queue>(C.queue)) {
      const incoming = q.ratePerSecond * world.params.trafficMultiplier * dt;
      q.depth += incoming;
      if (q.depth > q.capacity) {
        q.dropped += q.depth - q.capacity;
        q.depth = q.capacity;
      }
    }
  };
}

function queueDeliverySystem() {
  return (world: MicroserviceWorld, dt: number) => {
    for (const [, q] of world.entries<Queue>(C.queue)) {
      const targetService = world.require<Service>(q.to, C.service);
      const targetState = world.require<ServiceMachine>(q.to, 'serviceState').value;
      const availability = targetState === 'healthy' ? 1 : targetState === 'degraded' ? 0.38 : 0;
      const deliverable = Math.min(q.depth, targetService.capacityPerSecond * availability * dt / world.params.asyncDelayMultiplier);
      q.depth -= deliverable;
      targetService.processed += deliverable;
      world.require<Transform>(q.to, C.transform).pulse = Math.min(1, world.require<Transform>(q.to, C.transform).pulse + deliverable / Math.max(1, targetService.capacityPerSecond));

      if (targetState === 'down' && q.depth >= q.capacity) {
        const dropped = q.ratePerSecond * world.params.trafficMultiplier * dt * 0.2;
        q.dropped += dropped;
        targetService.dropped += dropped;
      }
    }
  };
}

function pulseDecaySystem() {
  return (world: MicroserviceWorld, dt: number) => {
    for (const [, transform] of world.entries<Transform>(C.transform)) {
      transform.pulse = Math.max(0, transform.pulse - dt * 1.5);
    }
  };
}

export function snapshotMicroserviceWorld(world: MicroserviceWorld): SimulationSnapshot {
  const viewport = world.entries<Viewport>(C.viewport)[0]?.[1] ?? { zoom: 1, offsetX: 0, offsetY: 0 };
  return {
    time: world.time,
    viewport,
    nodes: world.entitiesWith(C.service, C.transform, 'serviceState').map((id) => {
      const transform = world.require<Transform>(id, C.transform);
      const serviceData = world.require<Service>(id, C.service);
      const state = world.require<ServiceMachine>(id, 'serviceState');
      return { id, label: serviceData.name, x: transform.x, y: transform.y, radius: transform.radius, state: state.value, processed: serviceData.processed, dropped: serviceData.dropped, pulse: transform.pulse };
    }),
    edges: world.entitiesWith(C.queue, C.route).map((id) => {
      const q = world.require<Queue>(id, C.queue);
      const route = world.require<Route>(id, C.route);
      return { from: route.from, to: route.to, label: route.label, depth: q.depth, capacity: q.capacity, dropped: q.dropped };
    }),
  };
}
