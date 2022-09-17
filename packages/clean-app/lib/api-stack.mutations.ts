import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';
import { ulid } from 'ulid';

export const projectSchema = z.object({
  client: z.string(),
  location: z.string().optional(),
  position: z.string(),
  summary: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hightlights: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  contact: z.object({
    company: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type Project = z.infer<typeof projectSchema>;

const dbclient = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME || '';

export const handler = async (event: AppSyncResolverEvent<any>) => {
  const { arguments: { id, input }, info: { fieldName, parentTypeName }, identity } = event;
  if (parentTypeName === 'Mutation') {
    switch (fieldName) {
      case 'createProject':
        return await createProject(input as Project, identity as AppSyncIdentityCognito);
      case 'updateProject':
        return updateProject(id, input as Project, identity as AppSyncIdentityCognito);
      case 'removeProject':
        return removeProject(id, identity as AppSyncIdentityCognito);
      default:
        throw new Error(`Unknown mutation ${fieldName}`);
    }
  }
  return 'Only mutations are supported';
};

async function createProject (project: Project, identity: AppSyncIdentityCognito) {
  projectSchema.parse(project);
  const id = ulid();
  try {
    await putProject(id, project, identity);
    return {
      id,
      ...project,
    };
  } catch (e) {
    return e;
  }
}

async function updateProject (id: string, project: Project, identity: AppSyncIdentityCognito) {
  projectSchema.parse(project);
  try {
    await putProject(id, project, identity);
    return {
      id,
      ...project,
    };
  } catch (e) {
    return e;
  }
}
async function removeProject (id: string, identity: AppSyncIdentityCognito) {
  try {
    await deleteProject(id, identity);
    return 'ok';
  } catch (e) {
    return e;
  }
}

async function putProject (id: string, project: Project, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `PROJECT#${id}`;
  const item = {
    pk,
    sk,
    id,
    ...project,
  };
  return dbclient.put({ TableName, Item: item }).promise();
}

async function deleteProject (id: string, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `PROJECT#${id}`;
  return dbclient.delete({ TableName, Key: { pk, sk } }).promise();
}
