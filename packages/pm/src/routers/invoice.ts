import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { createInvoiceSchema } from '../types';

export const invoiceRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.adapter.getInvoices();
  }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.adapter.getInvoice(input.id);
    }),

  create: publicProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.createInvoice(input);
    }),

  markSent: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.markInvoiceSent(input.id);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.adapter.deleteInvoice(input.id);
      return { success: true };
    }),
});
