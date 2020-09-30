import { DynamoDB } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import { nanoid } from 'nanoid';

interface AppsyncResolverEvent {
  arguments: Record<string, unknown>;
  identity: {
    claims: {
      sub: string;
      'cognito:groups': string[];
      'email_verified': boolean;
      iss: string;
      'cognito:username': string;
      'cognito:roles': string[];
      aud: string;
      'event_id': string;
      'token_use': string;
      'auth_time': number;
      exp: number;
      iat: number;
      email: string;
    },
    defaultAuthStrategy: 'ALLOW' | 'DENY',
    groups: string[],
    issuer: string,
    sourceIp: string[],
    sub: string,
    username: string
  }
}

interface AddProjectEvent extends AppsyncResolverEvent {
  arguments: {
    project: {
      name: string;
    }
  }
  info: {
    fieldName: 'addProject';
    parentTypeName: 'Mutation'
  }
}

interface AddTrackingEvent extends AppsyncResolverEvent {
  arguments: {
    tracking: {
      projectId: string;
      startTime: string;
      endTime: string;
      description: string;
    }
  }
  info: {
    fieldName: 'addTracking';
    parentTypeName: 'Mutation'
  }
}

type MutationEventHandler = Handler<AddProjectEvent | AddTrackingEvent>

interface Project {
  id: string;
  name: string;
}

interface Tracking {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

const ddbClient = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME ?? '';

export const handler: MutationEventHandler = async (event) => {
  switch (event.info.fieldName) {
    case 'addProject': {
      const project = await addProject(event as AddProjectEvent);
      return project;
    }
    case 'addTracking': {
      const tracking = await addTracking(event as AddTrackingEvent);
      return tracking;
    }
    default:
      return {};
  }
};

const addProject = async (event: AddProjectEvent): Promise<Project> => {
  const { arguments: { project: args }, identity } = event;

  const projectId = nanoid();
  const pk = `project-${projectId}`;

  const project = {
    pk,
    sk: pk,
    name: args.name,
  };

  const userProject = {
    ...project,
    pk: identity.sub,
  };

  await ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: project,
      },
    }, {
      Put: {
        TableName,
        Item: userProject,
      },
    }],
  }).promise();

  return {
    id: projectId,
    name: project.name,
  };
};

const addTracking = async (event: AddTrackingEvent): Promise<Tracking> => {
  const { arguments: { tracking: args }, identity } = event;
  const trackingId = nanoid();
  const pk = `tracking-${trackingId}`;
  const sk = `tracking#${args.projectId}#${args.startTime}`;

  const tracking = {
    pk,
    sk,
    startTime: args.startTime,
    endTime: args.endTime,
    description: args.description,
  };

  const userTracking = {
    ...tracking,
    pk: identity.sub,
  };

  await ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: tracking,
      },
    }, {
      Put: {
        TableName,
        Item: userTracking,
      },
    }],
  }).promise();

  return {
    id: trackingId,
    description: tracking.description,
    startTime: tracking.startTime,
    endTime: tracking.endTime,
  };
};
