/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
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
  approval_contact: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TrackInput {
  id?: string;
  start_time: string;
  end_time: string;
  description: string;
}

const documentClient = new DynamoDB.DocumentClient();

async function track(input: TrackInput) {
  const id = `track-${nanoid()}`;

  const trackItem = {
    id,
    sort_key: id,
    start_time: input.start_time,
    end_time: input.end_time,
    description: input.description,
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
    sort_key: id,
    name: input.name,
    description: input.description,
    approval_contact: {
      id: input.approval_contact.id ?? null,
      first_name: input.approval_contact.first_name,
      last_name: input.approval_contact.last_name,
      email: input.approval_contact.email,
    },
  };

  const userProject = {
    id: `user-${identity.username}`,
    sort_key: id,
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
