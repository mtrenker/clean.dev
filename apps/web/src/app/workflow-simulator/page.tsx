import type { Metadata } from 'next';
import { WorkflowSimulator } from '@/components/sim/workflow-simulator';

export const metadata: Metadata = {
  title: 'Workflow Simulator | clean.dev',
  description: 'A clean.dev lab for exploring delivery-system flow with a small browser-based simulation.',
};

export default function WorkflowSimulatorPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">clean.dev lab</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Systems thinking playground</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            A browser-based simulation for exploring delivery-system flow, queue pressure and resilience patterns through a small microservice scenario.
          </p>
        </div>
        <WorkflowSimulator />
      </div>
    </main>
  );
}
