import { DynamoDB } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import { nanoid } from 'nanoid';

interface MutationResponse {
  code: string;
  success: boolean;
  message: string;
  [response: string]: any
}

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

interface CreateProjectEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      client: string;
      description: string;
      industry: string;
      technologies: string[];
      methodologies: string[];
      startDate: string;
      endDate: string;
    }
  }
  info: {
    fieldName: 'createProject';
    parentTypeName: 'Mutation'
  }
}
interface UpdateProjectEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      projectId: string;
      client: string;
      description: string;
      industry: string;
      technologies: string[];
      methodologies: string[];
      startDate: string;
      endDate: string;
    }
  }
  info: {
    fieldName: 'updateProject';
    parentTypeName: 'Mutation'
  }
}
interface DeleteProjectEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      projectId: string;
    }
  }
  info: {
    fieldName: 'deleteProject';
    parentTypeName: 'Mutation'
  }
}

interface CreateTrackingEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      projectId: string;
      startTime: string;
      endTime: string;
      description: string;
    }
  }
  info: {
    fieldName: 'createTracking';
    parentTypeName: 'Mutation'
  }
}
interface UpdateTrackingEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      trackingId: string;
      projectId: string;
      startTime: string;
      endTime: string;
      description: string;
    }
  }
  info: {
    fieldName: 'updateTracking';
    parentTypeName: 'Mutation'
  }
}
interface DeleteTrackingEvent extends AppsyncResolverEvent {
  arguments: {
    input: {
      trackingId: string;
    }
  }
  info: {
    fieldName: 'deleteTracking';
    parentTypeName: 'Mutation'
  }
}

type MutationEventHandler = Handler<
  CreateProjectEvent |
  UpdateProjectEvent |
  DeleteProjectEvent |
  CreateTrackingEvent |
  UpdateTrackingEvent |
  DeleteTrackingEvent
>

const ddbClient = new DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME ?? '';

export const handler: MutationEventHandler = async (event) => {
  switch (event.info.fieldName) {
    case 'createProject': {
      const response = await createProject(event as CreateProjectEvent);
      return response;
    }
    case 'updateProject': {
      const response = await updateProject(event as UpdateProjectEvent);
      return response;
    }
    case 'deleteProject': {
      const response = await deleteProject(event as DeleteProjectEvent);
      return response;
    }
    case 'createTracking': {
      const response = await createTracking(event as CreateTrackingEvent);
      return response;
    }
    case 'updateTracking': {
      const response = await updateTracking(event as UpdateTrackingEvent);
      return response;
    }
    case 'deleteTracking': {
      const response = await deleteTracking(event as DeleteTrackingEvent);
      return response;
    }
    default:
      return {};
  }
};

const createProject = async (event: CreateProjectEvent): Promise<MutationResponse> => {
  const {
    arguments: {
      input: {
        client, description, endDate, industry, methodologies, startDate, technologies,
      },
    }, identity,
  } = event;

  const projectId = nanoid();
  const pk = `project-${projectId}`;

  const project = {
    pk,
    sk: pk,
    id: projectId,
    client,
    description,
    industry,
    technologies,
    methodologies,
    startDate,
    endDate,
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
    code: '200',
    message: 'Project created',
    success: true,
    project,
  };
};

const updateProject = async (event: UpdateProjectEvent): Promise<MutationResponse> => {
  const {
    arguments: {
      input: {
        projectId, client, description, endDate, industry, methodologies, startDate, technologies,
      },
    }, identity,
  } = event;

  const pk = `project-${projectId}`;

  const project = {
    pk,
    sk: pk,
    id: projectId,
    client,
    description,
    industry,
    technologies,
    methodologies,
    startDate,
    endDate,
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
    code: '200',
    message: 'Project updated',
    success: true,
    project,
  };
};

const deleteProject = async (event: DeleteProjectEvent): Promise<MutationResponse> => {
  const {
    arguments: {
      input: { projectId },
    }, identity,
  } = event;

  const pk = `project-${projectId}`;
  const sk = pk;

  await ddbClient.transactWrite({
    TransactItems: [{
      Delete: {
        TableName,
        Key: {
          pk,
          sk,
        },
      },
    }, {
      Delete: {
        TableName,
        Key: {
          pk: identity.sub,
          sk,
        },
      },
    }],
  }).promise();

  return {
    code: '200',
    message: 'Project deleted',
    success: true,
  };
};

const createTracking = async (event: CreateTrackingEvent): Promise<MutationResponse> => {
  const { arguments: { input }, identity } = event;
  const trackingId = nanoid();
  const {
    description, startTime, endTime, projectId,
  } = input;
  const pk = `tracking-${trackingId}`;
  const sk = identity.sub;
  const data = `tracking#${projectId}#${startTime}`;

  const tracking = {
    pk,
    sk,
    data,
    id: trackingId,
    startTime,
    endTime,
    description,
  };

  await ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: tracking,
      },
    }],
  }).promise();

  return {
    code: '200',
    message: 'Tracking added',
    success: true,
    tracking,
  };
};

const updateTracking = async (event: UpdateTrackingEvent): Promise<MutationResponse> => {
  const { arguments: { input }, identity } = event;
  const {
    trackingId, description, projectId, endTime, startTime,
  } = input;
  const pk = `tracking-${trackingId}`;
  const sk = identity.sub;
  const data = `tracking#${projectId}#${startTime}`;

  const tracking = {
    pk,
    sk,
    data,
    id: trackingId,
    startTime,
    endTime,
    description,
  };

  await ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: tracking,
      },
    }],
  }).promise();

  return {
    code: '200',
    message: 'Tracking updated',
    success: true,
    tracking,
  };
};

const deleteTracking = async (event: DeleteTrackingEvent): Promise<MutationResponse> => {
  const { arguments: { input }, identity } = event;
  const pk = `tracking-${input.trackingId}`;
  const sk = identity.sub;

  await ddbClient.transactWrite({
    TransactItems: [{
      Delete: {
        TableName,
        Key: {
          pk,
          sk,
        },
      },
    }],
  }).promise();

  return {
    code: '200',
    message: 'Tracking deleted',
    success: true,
  };
};
