import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { createClient } from 'contentful';
import { nanoid } from 'nanoid';

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
  publishDate: string;
}

const TableName = process.env.TABLE_NAME ?? '';

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.CONTENTFUL_API_KEY ?? '',
});

const ddbClient = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event): Promise<string> => {
  const { body } = event;
  const parsedBody = JSON.parse(body ?? '') as WebhookBody;
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

const savePage = async (id: string): any => {
  const entry = await contentfulClient.getEntry<CmsPage>(id);
  const pageId = nanoid();
  const page = {
    pk: `page-${pageId}`,
    sk: entry.fields.slug,
    title: entry.fields.title,
  };
  ddbClient.transactWrite({
    TransactItems: [{
      Put: {
        TableName,
        Item: page,
      },
    }],
  });
};
