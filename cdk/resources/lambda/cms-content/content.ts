import { DynamoDB } from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';

interface CmsPage {
  fields: {
    title: string;
    slug: string;
    content: string;
  };
}

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const REGION = process.env.REGION ?? '';

const client = new DynamoDB.DocumentClient({
  region: REGION,
});

async function saveToDynamoDb(id: string, content: any): Promise<void> {
  await client.update({
    TableName: TABLE_NAME,
    Key: {
      id,
      sortKey: id,
    },
    UpdateExpression: 'set #title= :title, #content = :content, #slug = :slug',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#slug': 'slug',
      '#content': 'content',
    },
    ExpressionAttributeValues: {
      ':content': JSON.stringify(content.fields.content['en-US']),
      ':title': content.fields.title['en-US'],
      ':slug': content.fields.slug['en-US'],
    },
  }).promise();
}


export const handler: SNSHandler = async (event) => {
  const { Message } = event.Records[0].Sns;

  const content = JSON.parse(Buffer.from(Message, 'base64').toString());

  const id = `page-${content.fields.slug['en-US']}`;

  await saveToDynamoDb(id, content);
};
