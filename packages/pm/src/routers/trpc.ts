import { initTRPC } from '@trpc/server';
import type { IProjectManagementAdapter } from '../adapters';

export interface Context {
  adapter: IProjectManagementAdapter;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
