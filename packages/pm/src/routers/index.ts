import { router } from './trpc';
import { clientRouter } from './client';
import { timeEntryRouter } from './timeEntry';
import { invoiceRouter } from './invoice';
import { settingsRouter } from './settings';

export const appRouter = router({
  client: clientRouter,
  timeEntry: timeEntryRouter,
  invoice: invoiceRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
export * from './trpc';
