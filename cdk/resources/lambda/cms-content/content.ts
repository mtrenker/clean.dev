import { DynamoDB } from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const REGION = process.env.REGION ?? '';

const client = new DynamoDB.DocumentClient({
  region: REGION
});

export const handler = async (event: any) => {

  const { Message } = event.Records[0]?.Sns;

  const content = JSON.parse(Buffer.from(Message, "base64").toString());

  console.log("CONTENT:", content.fields.content);

  const id = `entry-${content.sys.id}`;

  await client.update({
    TableName: TABLE_NAME,
    Key: {
      id,
      sort_key: id
    },
    UpdateExpression: "set #content = :content",
    ExpressionAttributeNames: { '#content': 'content' },
    ExpressionAttributeValues: {
      ':content': content.fields.content
    }
  }).promise();
}