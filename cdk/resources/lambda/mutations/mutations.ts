import { DynamoDB, EventBridge } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import { nanoid } from 'nanoid';

import {
  TrackingInput, Tracking, ProjectInput, Project,
} from './graphql';

interface MutationEvent {
  info: {
    fieldName: string;
  };
  identity: {
    sub: string;
    username: string;
  };
  arguments: {
    input: TrackingInput | ProjectInput
  }
}

interface TrackEvent extends MutationEvent {
  info: {
    fieldName: 'track'
  };
  arguments: {
    input: TrackingInput;
  };
}

interface AddProjectEvent extends MutationEvent {
  info: {
    fieldName: 'addProject'
  };
  arguments: {
    input: ProjectInput;
  };
}

type EventType = AddProjectEvent | TrackEvent;

interface DynamoDBItem {
  pk: string;
  id: string;
}

interface TrackItem extends DynamoDBItem {
  startTime: string;
  endTime: string;
  description: string;
}

interface ProjectItem extends DynamoDBItem {
  client: string;
  industry: string;
  technologies: string[];
  methodologies: string[];
  startDate: string;
  endDate?: string|null;
  description: string;
}

interface IdentityProps {
  username: string;
  sub: string;
}

const documentClient = new DynamoDB.DocumentClient();
const eventBridge = new EventBridge();

async function track(event: TrackEvent): Promise<Tracking> {
  const { identity, arguments: { input } } = event;

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

    await eventBridge.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        DetailType: 'Tracking Added',
        Detail: JSON.stringify(eventDetail),
        Source: 'trackings',
      }],
    }).promise();
    return trackItem;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addProject(event: AddProjectEvent): Promise<Project> {
  const { identity, arguments: { input } } = event;
  const pk = `user-${identity?.sub}`;
  const projectId = nanoid(6);

  const {
    client,
    industry,
    technologies,
    methodologies,
    description,
    startDate,
    endDate,
  } = input;
  const id = input.id || `project-${projectId}`;

  const projectItem: ProjectItem = {
    pk,
    id,
    client,
    industry,
    technologies,
    methodologies,
    startDate,
    endDate,
    description,
  };

  try {
    await documentClient.put({
      TableName: process.env.TABLE_NAME ?? '',
      Item: projectItem,
    }).promise();

    const eventDetail = {
      identity,
      input,
      projectItem,
    };

    const detailType = input.id ? 'Project Updated' : 'Project Added';

    await eventBridge.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        DetailType: detailType,
        Detail: JSON.stringify(eventDetail),
        Source: 'projects',
      }],
    }).promise();
    return projectItem;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const handler: Handler<EventType> = async (event) => {
  const { info } = event;

  switch (info.fieldName) {
    case 'track':
      return track(event as TrackEvent);
    case 'addProject':
      return addProject(event as AddProjectEvent);
    default:
      return 'not implemented';
  }
};
