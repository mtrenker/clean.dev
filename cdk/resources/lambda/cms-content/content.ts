import { DynamoDB } from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const REGION = process.env.REGION ?? '';

const client = new DynamoDB.DocumentClient({
  region: REGION,
});

export const handler: SNSHandler = async (event) => {
  const { Message } = event.Records[0].Sns;

  const content = JSON.parse(Buffer.from(Message, 'base64').toString());

  const id = `page-${content.fields.slug['en-US']}`;

  await client.update({
    TableName: TABLE_NAME,
    Key: {
      id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      sort_key: id,
    },
    UpdateExpression: 'set #title= :title, #content = :content, #slug = :slug',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#slug': 'slug',
      '#content': 'content',
    },
    ExpressionAttributeValues: {
      ':content': content.fields.content['en-US'],
      ':title': content.fields.title['en-US'],
      ':slug': content.fields.slug['en-US'],
    },
  }).promise();
};
