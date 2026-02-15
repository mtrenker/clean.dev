import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { createTimeEntrySchema, updateTimeEntrySchema } from '../types';

export const timeEntryRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.adapter.getTimeEntries(input?.clientId);
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.adapter.getTimeEntry(input.id);
    }),

  listUninvoiced: publicProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.adapter.getUninvoicedTimeEntries(input?.clientId);
    }),

  create: publicProcedure
    .input(createTimeEntrySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.createTimeEntry(input);
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateTimeEntrySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.updateTimeEntry(input.id, input.data);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.adapter.deleteTimeEntry(input.id);
      return { success: true };
    }),
});
