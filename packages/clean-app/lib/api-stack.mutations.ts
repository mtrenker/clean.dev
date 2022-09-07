import { AppSyncResolverEvent } from 'aws-lambda';

export const handler = async (event: AppSyncResolverEvent<unknown>) => {
  const { arguments: args, info: { fieldName, parentTypeName } } = event;
  if (parentTypeName === 'Mutation') {
    switch (fieldName) {
      case 'createProject':
        return createProject(args);
      case 'updateProject':
        return updateProject(args);
      case 'deleteProject':
        return deleteProject(args);
      default:
        throw new Error(`Unknown mutation ${fieldName}`);
    }
  }
  return 'Only mutations are supported';
};

function createProject (_args: unknown): void {
  console.log('createProject', _args);

  throw new Error('Function not implemented.');
}

function updateProject (_args: unknown) {
  throw new Error('Function not implemented.');
}

function deleteProject (_args: unknown) {
  throw new Error('Function not implemented.');
}

