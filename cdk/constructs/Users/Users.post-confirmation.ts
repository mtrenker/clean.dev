import { CognitoIdentityServiceProvider, DynamoDB } from 'aws-sdk';
import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { nanoid } from 'nanoid';

const tableName = process.env.INVENTORY_TABLE_NAME ?? '';
const client = new DynamoDB.DocumentClient();
const cognito = new CognitoIdentityServiceProvider();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { request: { userAttributes } } = event;
  const userId = nanoid();
  userAttributes.userId = userId;
  try {
    await client.put({
      TableName: tableName,
      Item: {
        pk: `User-${userId}`,
        id: `User-${userId}`,
      },
    }).promise();
    await cognito.adminUpdateUserAttributes({
      UserAttributes: [{
        Name: 'custom:user',
        Value: userId,
      }],
      UserPoolId: event.userPoolId,
      Username: event.userName,
    }).promise();
  } catch (error) {
    console.error(error);
  }
  return event;
};
