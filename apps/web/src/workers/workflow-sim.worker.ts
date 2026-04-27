import {
  createMicroserviceScenario,
  snapshotMicroserviceWorld,
  type MicroserviceParams,
  type SimulationSnapshot,
} from '@cleandev/sim';

type InitMessage = { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number };
type ResizeMessage = { type: 'resize'; width: number; height: number; dpr: number };
type ParamsMessage = { type: 'params'; params: Partial<MicroserviceParams> };
type Message = InitMessage | ResizeMessage | ParamsMessage | { type: 'pause' } | { type: 'play' };

let canvas: OffscreenCanvas | undefined;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 800;
let height = 520;
let dpr = 1;
let running = true;
let last = 0;
const world = createMicroserviceScenario();

self.onmessage = (event: MessageEvent<Message>) => {
  const message = event.data;
  if (message.type === 'init') {
    canvas = message.canvas;
    ctx = canvas.getContext('2d');
    resize(message.width, message.height, message.dpr);
    requestAnimationFrame(tick);
  }
  if (message.type === 'resize') resize(message.width, message.height, message.dpr);
  if (message.type === 'params') world.params = { ...world.params, ...message.params };
  if (message.type === 'pause') running = false;
  if (message.type === 'play') running = true;
};

function resize(nextWidth: number, nextHeight: number, nextDpr: number): void {
  width = nextWidth;
  height = nextHeight;
  dpr = Math.max(1, Math.min(3, nextDpr));
  if (!canvas) return;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
}

function tick(now: number): void {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000 || 0.016));
  last = now;
  if (running) world.step(dt);
  if (ctx) draw(ctx, snapshotMicroserviceWorld(world));
  requestAnimationFrame(tick);
}

function draw(context: OffscreenCanvasRenderingContext2D, snapshot: SimulationSnapshot): void {
  context.save();
  context.scale(dpr, dpr);
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#07111f';
  context.fillRect(0, 0, width, height);

  context.translate(width / 2 + snapshot.viewport.offsetX, height / 2 + snapshot.viewport.offsetY);
  context.scale(snapshot.viewport.zoom, snapshot.viewport.zoom);

  const nodeById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  for (const edge of snapshot.edges) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) continue;
    const load = Math.min(1, edge.depth / edge.capacity);
    context.strokeStyle = load > 0.8 ? '#fb923c' : load > 0.55 ? '#facc15' : '#38bdf8';
    context.lineWidth = 3 + load * 7;
    context.globalAlpha = 0.35 + load * 0.5;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.globalAlpha = 1;

    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    context.fillStyle = '#dbeafe';
    context.font = '12px sans-serif';
    context.textAlign = 'center';
    context.fillText(`${edge.label}: ${Math.round(edge.depth)}/${edge.capacity}`, mx, my - 8);
  }

  for (const node of snapshot.nodes) {
    const stateColor = node.state === 'healthy' ? '#22c55e' : node.state === 'degraded' ? '#facc15' : '#ef4444';
    context.beginPath();
    context.arc(node.x, node.y, node.radius + node.pulse * 12, 0, Math.PI * 2);
    context.fillStyle = `${stateColor}33`;
    context.fill();

    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fillStyle = '#0f172a';
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = stateColor;
    context.stroke();

    context.fillStyle = '#f8fafc';
    context.font = 'bold 14px sans-serif';
    context.textAlign = 'center';
    context.fillText(node.label, node.x, node.y - 4);
    context.fillStyle = '#94a3b8';
    context.font = '11px sans-serif';
    context.fillText(`${node.state} · ${Math.round(node.processed)} handled`, node.x, node.y + 14);
  }

  context.restore();

  context.save();
  context.scale(dpr, dpr);
  context.fillStyle = '#bfdbfe';
  context.font = '12px sans-serif';
  context.fillText(`t=${snapshot.time.toFixed(1)}s · OffscreenCanvas worker`, 16, height - 18);
  context.restore();
}
