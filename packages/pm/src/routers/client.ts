import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { createClientSchema, updateClientSchema } from '../types';

export const clientRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.adapter.getClients();
  }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.adapter.getClient(input.id);
    }),

  create: publicProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.createClient(input);
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateClientSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.updateClient(input.id, input.data);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.adapter.deleteClient(input.id);
      return { success: true };
    }),
});
