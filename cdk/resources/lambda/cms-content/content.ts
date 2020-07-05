import { DynamoDB } from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';
import { BLOCKS } from '@contentful/rich-text-types';
import { createClient, Entry } from 'contentful';

interface Author {
  name: string;
  avarar: string;
  page: CmsLink;
}

interface Body<ContentId, Fields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    publishedCounter: number,
    version: number,
    contentType: {
      sys: {
        type: string;
        linkType: string;
        id: ContentId;
      }
    };
  }
  fields: Fields
}

interface PageFields {
  title: Localized<string>;
  slug: Localized<string>;
  content: Localized<CmsNode>;
}

type Page = Body<'page', PageFields>

interface PostFields {
  title: Localized<string>;
  author: Localized<CmsLink>;
  intro: Localized<CmsNode>;
  content: Localized<CmsNode>;
}

type Post = Body<'post', PostFields>

type EventBody = Page | Post;

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

interface Blueprint {
  name: string;
}

interface Localized<T> {
  [language: string]: T
}

interface CmsLink {
  sys: {
    type: string;
    linkType: string;
    id: string;
  }
}

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const REGION = process.env.REGION ?? '';

const client = new DynamoDB.DocumentClient({
  region: REGION,
});

const contentfulClient = createClient({
  accessToken: process.env.CONTENTFUL_API_KEY || '',
  space: process.env.CONTENTFUL_SPACE_ID || '',
});

async function putDocument(id: string, document: Record<string, unknown>) {
  await client.put({
    TableName: TABLE_NAME,
    Item: {
      pk: id,
      id,
      ...document,
    },

  }).promise();
}

async function resolveContentfulAuthor(authorLink: CmsLink): Promise<Entry<Author>> {
  const author = await contentfulClient.getEntry<Author>(authorLink.sys.id);
  return author;
}

async function resolveContentfulNodes(content: CmsNode) {
  const promises = content.content.map(async (node: CmsNode) => {
    if (node.nodeType === BLOCKS.EMBEDDED_ENTRY) {
      const entry = await contentfulClient.getEntry<Blueprint>(node.data.target?.sys.id ?? 'no-id');
      return { nodeType: entry.fields.name, data: {}, content: [] };
    }
    return new Promise<CmsNode>((resolve) => resolve(node));
  });
  const resolvedContent = await Promise.all(promises);
  console.log('UNRESOLVED', content);
  console.log('RESOLVED', resolvedContent);

  return resolvedContent;
}

export const handler: SNSHandler = async (event) => {
  const lang = 'en-US';
  const { Message } = event.Records[0].Sns;
  const body = JSON.parse(Buffer.from(Message, 'base64').toString()) as EventBody;

  switch (body.sys.contentType.sys.id) {
    case 'post': {
      const post = body.fields as PostFields;
      const id = `post-${body.sys.id}`;
      const content = await resolveContentfulNodes(post.content[lang]);
      const author = await resolveContentfulAuthor(post.author[lang]);
      const postDocument = {
        title: post.title[lang],
        author: author.fields,
        intro: JSON.stringify(post.intro[lang]),
        content: JSON.stringify(content),
      };
      await putDocument(id, postDocument);
      break;
    }
    case 'page': {
      const page = body.fields as PageFields;
      const id = `page-${page.slug[lang]}`;
      const content = await resolveContentfulNodes(page.content[lang]);
      const pageDocument = {
        title: page.title[lang],
        slug: page.slug[lang],
        content: JSON.stringify(content),
      };
      await putDocument(id, pageDocument);
      break;
    }
    default:
      break;
  }
};
