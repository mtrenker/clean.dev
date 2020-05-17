import { DynamoDB } from 'aws-sdk';
import nanoid from 'nanoid';

interface EventProps<TInput> {
  arguments: {
    input: TInput;
  };
  identity: IdentityProps;
  info: {
    fieldName: 'track';
    parentTypeName: string;
  };
}

interface IdentityProps {
  username: string;
  groups: string[];
}

interface ProjectInput {
  id?: string;
  name: string;
  description: string;
  approvalContact: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TrackInput {
  id?: string;
  projectId: string;
  startTime: string;
  endTime: string;
  description: string;
}

const documentClient = new DynamoDB.DocumentClient();

async function track(input: TrackInput) {
  const id = `tracking-${nanoid()}`;

  const {
    projectId, startTime, endTime, description,
  } = input;
  const startDate = new Date(startTime);
  const sortKey = `tracking-${projectId}-${startDate.toISOString()}`;

  const trackItem = {
    id,
    sortKey,
    startTime,
    endTime,
    description,
  };

  try {
    await documentClient.put({
      TableName: process.env.TABLE_NAME ?? '',
      Item: trackItem,
    }).promise();

    return trackItem;
  } catch (error) {
    console.error(error);

    return error;
  }
}

async function createProject(input: ProjectInput, identity: IdentityProps) {
  const id = `project-${nanoid()}`;

  const project = {
    id,
    sortKey: id,
    name: input.name,
    description: input.description,
    approvalContact: {
      id: input.approvalContact.id ?? null,
      firstName: input.approvalContact.firstName,
      lastName: input.approvalContact.lastName,
      email: input.approvalContact.email,
    },
  };

  const userProject = {
    id: `user-${identity.username}`,
    sortKey: id,
    name: input.name,
  };

  try {
    await documentClient.batchWrite({
      RequestItems: {
        [process.env.TABLE_NAME!]: [{
          PutRequest: {
            Item: project,
          },
        }, {
          PutRequest: {
            Item: userProject,
          },
        }],
      },
    }).promise();

    return project;
  } catch (error) {
    console.error(error);

    return error;
  }
}

export const handler = async (event: EventProps<TrackInput>, context: any) => {
  const { arguments: { input }, info } = event;

  switch (info.fieldName) {
    case 'track':
      return track(input);
    default:
  }
};
