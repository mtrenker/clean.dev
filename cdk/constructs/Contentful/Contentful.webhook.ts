import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { createClient } from 'contentful';

interface WebhookBody {
  sys: {
    type: 'Entry';
    id: string;
    space: {
      sys: {
        type: 'Link';
        linkType: 'Space';
        id: string
      }
    };
    environment: {
      sys: {
        id: string;
        type: 'Link';
        linkType: 'Environment'
      }
    };
    contentType: {
      sys: {
        type: 'Link';
        linkType: 'ContentType';
        id: 'post' | 'page'
      }
    };
    revision: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface CmsPage {
  title: string;
  slug: string;
  content: string;
}

const TableName = process.env.TABLE_NAME ?? '';

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.CONTENTFUL_API_KEY ?? '',
});

const ddbClient = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event): Promise<string> => {
  const { body } = event;

  if (!body) {
    return 'no body';
  }

  const parsedBody = JSON.parse(Buffer.from(body, 'base64').toString()) as WebhookBody;
  const { id, contentType } = parsedBody.sys;
  switch (contentType.sys.id) {
    case 'page': {
      await savePage(id);
      return 'ok';
    }

    default:
      return 'nothing to save';
  }
};

const savePage = async (id: string): Promise<void> => {
  const entry = await contentfulClient.getEntry<CmsPage>(id);

  const page = {
    pk: `page-${entry.sys.id}`,
    sk: entry.fields.slug,
    title: entry.fields.title,
    slug: entry.fields.slug,
    content: JSON.stringify(entry.fields.content),
  };
  await ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: page,
      },
    }],
  }).promise();
};
