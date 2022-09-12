import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';
import { ulid } from 'ulid';

const project = z.object({
  client: z.string(),
  location: z.string().optional(),
  position: z.string(),
  summary: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hightlights: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export type Project = z.infer<typeof project>;

const dbclient = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME || '';

export const handler = async (event: AppSyncResolverEvent<unknown>) => {
  const { arguments: args, info: { fieldName, parentTypeName }, identity } = event;
  if (parentTypeName === 'Mutation') {
    switch (fieldName) {
      case 'createProject':
        return await createProject(args as Project, identity as AppSyncIdentityCognito);
      case 'updateProject':
        return updateProject(args);
      case 'removeProject':
        return removeProject(args);
      default:
        throw new Error(`Unknown mutation ${fieldName}`);
    }
  }
  return 'Only mutations are supported';
};

async function createProject (args: Project, identity: AppSyncIdentityCognito) {
  const { success } = project.safeParse(args);
  const { sub } = identity;

  if (!success) {
    throw new Error('Invalid project');
  }

  try {
    const id = ulid();
    const { $response: { data } } = await dbclient.put({
      TableName,
      Item: {
        pk: `USER#${sub}`,
        sk: `PROJECT#${id}`,
        id,
        ...args,
      },
    }).promise();
    return data;
  } catch (error) {
    return error;
  }
}

function updateProject (_args: unknown) {
  throw new Error('Function not implemented.');
}
function removeProject (_args: unknown) {
  throw new Error('Function not implemented.');
}

