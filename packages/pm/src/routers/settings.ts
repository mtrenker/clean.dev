import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { updateSettingsSchema } from '../types';

export const settingsRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.adapter.getSettings();
  }),

  update: publicProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.adapter.updateSettings(input);
    }),
});
