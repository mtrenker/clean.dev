import * as trpc from '@trpc/server';
import { CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';
import { z } from 'zod';
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { DynamoDB } from 'aws-sdk';

const tableName = process.env.TABLE_NAME || '';
const ddbClient = new DynamoDB.DocumentClient();

const appRouter = trpc.router().query('create', {
  input: z.string(),
  async resolve (req) {
    req.input; // string
    await ddbClient.put({
      TableName: tableName,
      Item: {
        id: req.input,
        createdAt: new Date().toISOString(),
      },
    }).promise();
    return { id: req.input, name: 'Bilbo' };
  },
});

const createContext = (_props: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({}); // no context
export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
});

export type AppRouter = typeof appRouter;
