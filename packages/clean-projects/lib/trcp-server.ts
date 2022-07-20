import * as trpc from '@trpc/server';
import { CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';
import { z } from 'zod';
import { APIGatewayProxyEventV2 } from "aws-lambda";

const appRouter = trpc.router().query('hello', {
  input: z.string(),
  async resolve (req) {
    req.input; // string
    return { id: req.input, name: 'Bilbo' };
  },
});

const createContext = ({
  event,
  context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({}); // no context
type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
});

export type AppRouter = typeof appRouter;
