'use client';

import { useEffect, useRef, useState } from 'react';
import type { MicroserviceParams } from '@cleandev/sim';

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export function WorkflowSimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [supported, setSupported] = useState(true);
  const [params, setParams] = useState<MicroserviceParams>({
    trafficMultiplier: 1,
    failureMultiplier: 1,
    asyncDelayMultiplier: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !('transferControlToOffscreen' in canvas)) {
      setSupported(false);
      return;
    }

    const worker = new Worker(new URL('../../workers/workflow-sim.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    const offscreen = canvas.transferControlToOffscreen();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'resize', width: rect.width, height: rect.height, dpr: window.devicePixelRatio });
    };

    const rect = canvas.getBoundingClientRect();
    worker.postMessage({ type: 'init', canvas: offscreen, width: rect.width, height: rect.height, dpr: window.devicePixelRatio }, [offscreen]);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    workerRef.current?.postMessage({ type: 'params', params });
  }, [params]);

  const updateParam = (key: keyof MicroserviceParams, value: number) => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="rounded-sm border border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-slate-950/40">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Workflow simulation</p>
          <h2 className="text-2xl font-semibold text-white">Microservice flow under stress</h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Services, queues, outages, recovery and backlog pressure are ECS entities/components. The simulation and canvas rendering run in an OffscreenCanvas worker.
          </p>
        </div>
        <div className="text-xs text-slate-400">Zero-dependency engine package: <code>@cleandev/sim</code></div>
      </div>

      {!supported ? (
        <div className="grid h-[520px] place-items-center rounded-sm bg-slate-900 text-slate-200">
          This browser does not support OffscreenCanvas transfer. We can add a main-thread fallback next.
        </div>
      ) : (
        <canvas ref={canvasRef} className="h-[520px] w-full rounded-sm bg-slate-900" />
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Slider label="Traffic / messages per minute" min={0.25} max={3} step={0.05} value={params.trafficMultiplier} onChange={(value) => updateParam('trafficMultiplier', value)} />
        <Slider label="Failure rate" min={0} max={5} step={0.1} value={params.failureMultiplier} onChange={(value) => updateParam('failureMultiplier', value)} />
        <Slider label="Async delay / queue latency" min={0.5} max={4} step={0.05} value={params.asyncDelayMultiplier} onChange={(value) => updateParam('asyncDelayMultiplier', value)} />
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <label className="rounded-sm border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
      <span className="mb-2 flex justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono text-sky-300">{value.toFixed(2)}×</span>
      </span>
      <input
        className="w-full accent-sky-400"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
