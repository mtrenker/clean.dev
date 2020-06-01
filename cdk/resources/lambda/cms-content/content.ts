import { DynamoDB } from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';
import { BLOCKS } from '@contentful/rich-text-types';
import { createClient } from 'contentful';


interface CmsNode {
  nodeType: string;
  data: {
    target?: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      }
    }
  };
  content: CmsNode[]
}

interface WidgetEntry {
  name: string;
  type: string;
}

interface Localized<T> {
  [language: string]: T
}

interface CmsPage {
  fields: {
    title: Localized<string>;
    slug: Localized<string>;
    content: Localized<CmsNode>;
  };
}

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const REGION = process.env.REGION ?? '';

const client = new DynamoDB.DocumentClient({
  region: REGION,
});

async function saveToDynamoDb(id: string, page: CmsPage): Promise<void> {
  await client.update({
    TableName: TABLE_NAME,
    Key: {
      pk: id,
      id,
    },
    UpdateExpression: 'set #title= :title, #content = :content, #slug = :slug',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#slug': 'slug',
      '#content': 'content',
    },
    ExpressionAttributeValues: {
      ':content': JSON.stringify(page.fields.content['en-US']),
      ':title': page.fields.title['en-US'],
      ':slug': page.fields.slug['en-US'],
    },
  }).promise();
}

export const handler: SNSHandler = async (event) => {
  const { Message } = event.Records[0].Sns;
  const page = JSON.parse(Buffer.from(Message, 'base64').toString()) as CmsPage;
  const { slug } = page.fields;
  const id = `page-${slug['en-US']}`;

  const contentfulClient = createClient({
    accessToken: process.env.CONTENTFUL_API_KEY || '',
    space: process.env.CONTENTFUL_SPACE_ID || '',
  });

  const promises = page.fields.content['en-US'].content.map(async (node, index) => {
    if (node.nodeType === BLOCKS.EMBEDDED_ENTRY) {
      const entry = await contentfulClient.getEntry<WidgetEntry>(node.data.target?.sys.id ?? 'no-id');
      page.fields.content['en-US'].content[index] = { nodeType: entry.fields.type, data: {}, content: [] };
    }
  });

  await Promise.all(promises);

  await saveToDynamoDb(id, page);
};
