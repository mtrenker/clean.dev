import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Asset, createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';

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
  content: Document;
  layout: string;
}

interface CmsPost {
  title: string;
  publishDate: string;
  slug: string;
  heroImage: Asset;
  intro: Document;
  content: Document;
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
  const result = await saveEntry(id, contentType.sys.id);
  return result;
};

const saveEntry = async (id: string, type: 'post' | 'page'): Promise<string> => {
  switch (type) {
    case 'page': {
      const entry = await contentfulClient.getEntry<CmsPage>(id);
      const {
        fields: {
          content, slug, layout, title,
        },
      } = entry;

      const page = {
        id,
        pk: `page-${entry.sys.id}`,
        sk: slug,
        data: slug,
        title,
        slug,
        layout,
        content: JSON.stringify(content),
      };
      await ddbClient.transactWrite({
        TransactItems: [{
          Put: {
            TableName,
            Item: page,
          },
        }],
      }).promise();
      return 'ok';
    }
    case 'post': {
      const entry = await contentfulClient.getEntry<CmsPost>(id);
      const {
        fields: {
          intro, heroImage, content, slug, title, publishDate,
        },
      } = entry;

      const post = {
        id,
        pk: `post-${entry.sys.id}`,
        sk: slug,
        data: slug,
        title,
        slug,
        heroImage: heroImage.fields,
        publishDate,
        intro: JSON.stringify(intro),
        content: JSON.stringify(content),
      };

      const postListItem = {
        id: post.id,
        title: post.title,
        slug: post.slug,
      };

      await ddbClient.transactWrite({
        TransactItems: [{
          Put: {
            TableName,
            Item: post,
          },
        }, {
          Update: {
            TableName,
            Key: {
              pk: 'blog',
              sk: 'blog-overview',
            },
            UpdateExpression: 'SET #blogList.#blogPost = :blogPost',
            ExpressionAttributeNames: {
              '#blogList': 'list',
              '#blogPost': post.id,
            },
            ExpressionAttributeValues: {
              ':blogPost': postListItem,
            },
          },
        }],
      }).promise();
      return 'ok';
    }
  }
  return 'nothing to do';
};
