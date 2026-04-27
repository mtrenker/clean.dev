import { WorkflowSimulator } from '@/components/sim/workflow-simulator';

export default function WorkflowSimulatorPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">clean.dev lab</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Systems thinking playground</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            A first vertical slice for simulating flow problems across factories, teams, games, cities and software architectures. This scenario maps microservices to the same ECS/state-machine engine we can reuse for the other domains.
          </p>
        </div>
        <WorkflowSimulator />
      </div>
    </main>
  );
}
