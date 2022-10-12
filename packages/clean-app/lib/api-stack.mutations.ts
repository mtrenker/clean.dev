import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';
import { ulid } from 'ulid';

export const contactSchema = z.object({
  company: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  bank: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  vat: z.string().optional(),
});

export const projectInputSchema = z.object({
  client: z.string(),
  location: z.string().optional(),
  position: z.string(),
  summary: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.object({
    description: z.string(),
  })).optional(),
  categories: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
    rate: z.number().optional(),
  })).optional(),
  featured: z.boolean().optional(),
  contact: contactSchema.optional(),
});

export const trackingInputSchema = z.object({
  projectId: z.string(),
  category: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  summary: z.string().optional(),
});

export const userInputSchema = z.object({
  contact: contactSchema,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type TrackingInput = z.infer<typeof trackingInputSchema>;
export type UserInput = z.infer<typeof userInputSchema>;

const dbclient = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME || '';

export const handler = async (event: AppSyncResolverEvent<any>) => {
  const { arguments: { id, input }, info: { fieldName, parentTypeName }, identity } = event;
  if (parentTypeName === 'Mutation') {
    switch (fieldName) {
    case 'createProject':
      return await createProject(input as ProjectInput, identity as AppSyncIdentityCognito);
    case 'updateProject':
      return await updateProject(id, input as ProjectInput, identity as AppSyncIdentityCognito);
    case 'removeProject':
      return await removeProject(id, identity as AppSyncIdentityCognito);
    case 'createTracking':
      return createTracking(input as TrackingInput, identity as AppSyncIdentityCognito);
    case 'removeTracking':
      return removeTracking(input as TrackingInput, identity as AppSyncIdentityCognito);
    case 'updateProfile':
      return updateProfile(input as UserInput, identity as AppSyncIdentityCognito);
    default:
      throw new Error(`Unknown mutation ${fieldName}`);
    }
  }
  return 'Only mutations are supported';
};

async function createProject (project: ProjectInput, identity: AppSyncIdentityCognito) {
  projectInputSchema.parse(project);
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

async function updateProject (id: string, project: ProjectInput, identity: AppSyncIdentityCognito) {
  projectInputSchema.parse(project);
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

async function putProject (id: string, project: ProjectInput, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `PROJECT#${id}`;
  const item = {
    pk,
    sk,
    id,
    ...project,
    featured: project.featured || false,
    categories: project.categories ?? [],
    highlights: project.highlights ?? [],
  };
  return dbclient.put({ TableName, Item: item }).promise();
}

async function deleteProject (id: string, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `PROJECT#${id}`;
  return dbclient.delete({ TableName, Key: { pk, sk } }).promise();
}

async function createTracking (tracking: TrackingInput, identity: AppSyncIdentityCognito) {
  trackingInputSchema.parse(tracking);
  try {
    await putTracking(tracking, identity);
    return {
      ...tracking,
    };
  } catch (e) {
    return e;
  }
}

async function removeTracking (tracking: TrackingInput, identity: AppSyncIdentityCognito) {
  try {
    await deleteTracking(tracking.projectId, tracking.startTime, identity);
    return 'ok';
  } catch (e) {
    return e;
  }
}

async function putTracking (tracking: TrackingInput, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `TRACKING#${tracking.projectId}#${tracking.startTime}`;
  const item = {
    pk,
    sk,
    ...tracking,
  };
  return dbclient.put({ TableName, Item: item }).promise();
}

async function updateProfile (user: UserInput, identity: AppSyncIdentityCognito) {
  userInputSchema.parse(user);
  try {
    await putProfile(user, identity);
    return {
      ...user,
    };
  } catch (e) {
    return e;
  }
}

async function putProfile (user: UserInput, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `USER#${sub}`;
  const item = {
    pk,
    sk,
    ...user,
  };
  return dbclient.put({ TableName, Item: item }).promise();
}

async function deleteTracking (projectId: string, startTime: string, identity: AppSyncIdentityCognito) {
  const { sub } = identity;
  const pk = `USER#${sub}`;
  const sk = `TRACKING#${projectId}#${startTime}`;
  return await dbclient.delete({ TableName, Key: { pk, sk } }).promise();
}
