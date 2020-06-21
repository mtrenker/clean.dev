import { DynamoDB, EventBridge } from 'aws-sdk';
import { Handler } from 'aws-lambda';

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
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

const documentClient = new DynamoDB.DocumentClient();

async function track(input: TrackingInput, identity?: IdentityProps): Promise<TrackItem> {
  const eventBridge = new EventBridge();
  const pk = `user-${identity?.sub}`;

  const {
    projectId, startTime, endTime, description,
  } = input;
  const startDate = new Date(startTime);
  const id = `tracking-${projectId}-${startDate.toISOString()}`;

  const trackItem: TrackItem = {
    pk,
    id,
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

    const result = await eventBridge.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        DetailType: 'Tracking Added',
        Detail: JSON.stringify(eventDetail),
        Source: 'clean.api.mutation.track',
      }],
    }).promise();
    console.log('RESULT!!!!!!!', result);

    return trackItem;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addProject(input: TrackingInput, identity: IdentityProps): Promise<boolean> {
  console.log(input, identity);
  return true;
}

export const handler: Handler<TrackingEvent> = async (event) => {
  const { arguments: { input }, info } = event;

  switch (info.fieldName) {
    case 'track':
      return track(input, event.identity);
    case 'addProject':
      return addProject(input, event.identity);
    default:
      return 'not implemented';
  }
};
