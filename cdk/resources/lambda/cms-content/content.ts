import { DynamoDB } from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';
import { BLOCKS } from '@contentful/rich-text-types';
import { createClient, Asset } from 'contentful';

interface Image {
  title: string;
  description: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

interface CmsAuthor {
  name: string;
  avatar: Asset;
  page: CmsLink;
}

interface Author {
  name: string;
  avatar: Image;
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
  publishDate: Localized<string>;
  slug: Localized<string>;
  author: Localized<CmsLink>;
  heroImage: Localized<CmsLink>;
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

async function putDocument(pk: string, id: string, document: Record<string, unknown>) {
  await client.put({
    TableName: TABLE_NAME,
    Item: {
      pk,
      id,
      ...document,
    },

  }).promise();
}

function mapAsset(asset: Asset): Image {
  const { fields: { file, title, description } } = asset;
  return {
    title,
    description,
    height: file.details.image?.height ?? 0,
    width: file.details.image?.width ?? 0,
    size: file.details.size,
    url: file.url,
  };
}

async function resolveAsset(link: CmsLink): Promise<Asset> {
  const asset = await contentfulClient.getAsset(link.sys.id);
  return asset;
}

async function resolveLink(link: CmsLink): Promise<Author> {
  const { fields: { avatar, name, page } } = await contentfulClient.getEntry<CmsAuthor>(link.sys.id);
  return {
    avatar: mapAsset(avatar),
    name,
    page,
  };
}

async function resolveContentfulNodes(node: CmsNode): Promise<CmsNode> {
  const promises = node.content.map(async (subNode: CmsNode) => {
    if (subNode.nodeType === BLOCKS.EMBEDDED_ENTRY) {
      const entry = await contentfulClient.getEntry<Blueprint>(subNode.data.target?.sys.id ?? 'no-id');
      return { nodeType: entry.fields.name, data: {}, content: [] };
    }
    return new Promise<CmsNode>((resolve) => resolve(subNode));
  });
  const resolvedContent = await Promise.all(promises);
  return {
    ...node,
    content: resolvedContent,
  };
}

async function updateBlogList(
  id: string,
  slug: string,
  title: string,
  publishDate: string,
  intro: CmsNode,
  author: Author,
): Promise<void> {
  const blogPost = {
    id,
    slug,
    publishDate,
    title,
    intro: JSON.stringify(intro),
    author,
  };
  try {
    const key = {
      pk: 'blog-list',
      id: 'blog-list',
    };
    const blogList = await client.get({
      TableName: TABLE_NAME,
      Key: key,
    }).promise();
    if (!blogList.Item) {
      await client.put({
        TableName: TABLE_NAME,
        Item: {
          ...key,
          blogPosts: [blogPost],
        },
      }).promise();
    } else {
      const item = blogList.Item;
      const { blogPosts } = <{blogPosts: {id: string; publishDate: string;}[]}>item;
      const filteredBlogPosts = blogPosts.filter((post) => post.id !== blogPost.id);
      filteredBlogPosts.push(blogPost);
      const sortedBlogPosts = filteredBlogPosts.sort(
        (postA, postB) => new Date(postB.publishDate).getTime() - new Date(postA.publishDate).getTime(),
      );
      await client.update({
        Key: key,
        TableName: TABLE_NAME,
        UpdateExpression: 'SET #blogPosts = :blogPosts',
        ExpressionAttributeNames: {
          '#blogPosts': 'blogPosts',
        },
        ExpressionAttributeValues: {
          ':blogPosts': sortedBlogPosts,
        },
      }).promise();
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler: SNSHandler = async (event) => {
  const lang = 'en-US';
  const { Message } = event.Records[0].Sns;
  const body = JSON.parse(Buffer.from(Message, 'base64').toString()) as EventBody;

  switch (body.sys.contentType.sys.id) {
    case 'post': {
      const post = body.fields as PostFields;
      const pk = `blog-${post.slug[lang]}`;
      const id = pk;
      const blogId = body.sys.id;
      const slug = post.slug[lang];
      const title = post.title[lang];
      const publishDate = post.publishDate[lang];
      const intro = await resolveContentfulNodes(post.intro[lang]);
      const content = await resolveContentfulNodes(post.content[lang]);
      const author = await resolveLink(post.author[lang]);
      const heroAsset = await resolveAsset(post.heroImage[lang]);
      const postDocument = {
        title,
        slug,
        publishDate,
        author,
        heroImage: mapAsset(heroAsset),
        intro: JSON.stringify(intro),
        content: JSON.stringify(content),
      };
      await putDocument(pk, id, postDocument);
      await updateBlogList(blogId, slug, title, publishDate, intro, author);
      break;
    }
    case 'page': {
      const page = body.fields as PageFields;
      const pk = `page-${page.slug[lang]}`;
      const id = pk;
      const content = await resolveContentfulNodes(page.content[lang]);
      const pageDocument = {
        title: page.title[lang],
        slug: page.slug[lang],
        content: JSON.stringify(content),
      };
      await putDocument(pk, id, pageDocument);
      break;
    }
    default:
      break;
  }
};
