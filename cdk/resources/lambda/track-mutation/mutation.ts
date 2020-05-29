import { DynamoDB, EventBridge } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import nanoid from 'nanoid';

interface IdentityProps {
  username: string;
  sub: string;
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

interface TrackingInput {
  id?: string;
  projectId: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface TrackItem {
  pk: string;
  sk: string;
  startTime: string;
  endTime: string;
  description: string;
}

const documentClient = new DynamoDB.DocumentClient();

async function track(input: TrackingInput, identity?: IdentityProps): Promise<TrackItem> {
  const eventBridge = new EventBridge();
  const id = `user-${identity?.sub}`;

  const {
    projectId, startTime, endTime, description,
  } = input;
  const startDate = new Date(startTime);
  const sk = `tracking-${projectId}-${startDate.toISOString()}`;

  const trackItem: TrackItem = {
    pk: id,
    sk,
    startTime,
    endTime,
    description,
  };

  try {
    await documentClient.put({
      TableName: process.env.TABLE_NAME ?? '',
      Item: trackItem,
    }).promise();

    const eventDetail = {
      identity,
      input,
      trackItem,
    };

    await eventBridge.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        DetailType: 'Tracking Added',
        Detail: JSON.stringify(eventDetail),
        Source: 'clean.api.mutation.track',
      }],
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
    pk: id,
    sk: id,
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
    pk: `user-${identity.username}`,
    sk: id,
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

interface TrackingEvent {
  info: {
    fieldName: string;
  };
  arguments: {
    input: TrackingInput;
  };
  identity: {
    sub: string;
    username: string;
  };
}

export const handler: Handler<TrackingEvent> = async (event) => {
  const { arguments: { input }, info } = event;

  switch (info.fieldName) {
    case 'track': {
      return track(input, event.identity);
    }
    default:
      return 'not implemented';
  }
};
