/**
 * Custom Node.js server for @cleandev/web.
 *
 * Wraps the Next.js request handler with a Node.js HTTP server and attaches a
 * WebSocket server on /api/cockpit/ws for authenticated cockpit daemons.
 *
 * Production CMD (Dockerfile):
 *   node apps/web/custom-server.js
 *
 * Development:
 *   Use `pnpm dev` (next dev) — WebSocket support is production-only via this
 *   file.  Set COCKPIT_WS_ENABLED=true in local env to opt-in to WS in dev.
 *
 * Environment variables:
 *   PORT               Server port (default: 3000)
 *   HOSTNAME           Server hostname (default: 0.0.0.0)
 *   COCKPIT_WS_ENABLED If "false" the WS server is not attached (default: true)
 */

import { createServer } from 'node:http';
import next from 'next';
import { CockpitWsServer } from './src/server/cockpit-ws';
import { getCockpitRepository } from './src/lib/cockpit-repo';
import { CockpitProjector } from './src/lib/cockpit/projector';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? '0.0.0.0';
const port = parseInt(process.env.PORT ?? '3000', 10);
const wsEnabled = process.env.COCKPIT_WS_ENABLED !== 'false';

async function main(): Promise<void> {
  const app = next({ dev, hostname, port, dir: __dirname });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = createServer((req, res) => {
    void handle(req, res);
  });

  const repo = getCockpitRepository();
  const projector = new CockpitProjector(repo);
  projector.start();
  console.info('[server] Cockpit projector started');

  if (wsEnabled) {
    new CockpitWsServer(server, repo);
    console.info('[server] Cockpit WebSocket server attached on /api/cockpit/ws');
  } else {
    console.info('[server] Cockpit WebSocket server disabled (COCKPIT_WS_ENABLED=false)');
  }

  server.listen(port, hostname, () => {
    console.info(`[server] Listening on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  for (const signal of signals) {
    process.once(signal, () => {
      console.info(`[server] ${signal} received, shutting down…`);
      projector.stop();
      server.close(() => {
        console.info('[server] HTTP server closed');
        process.exit(0);
      });
    });
  }
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
