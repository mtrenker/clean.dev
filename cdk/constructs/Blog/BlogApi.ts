import {
  DynamoDbDataSource, GraphqlApi, GraphqlType, MappingTemplate, ObjectType, ResolvableField,
} from '@aws-cdk/aws-appsync';
import { Construct } from '@aws-cdk/core';

interface BlogApiProps {
  api: GraphqlApi
  querySource: DynamoDbDataSource
}

export class BlogApi extends Construct {
  constructor(scope: Construct, id: string, props: BlogApiProps) {
    super(scope, id);

    const { api, querySource } = props;

    const requiredString = GraphqlType.string({ isRequired: true });

    const pageType = new ObjectType('Page', {
      definition: {
        title: requiredString,
        slug: requiredString,
        content: requiredString,
        layout: requiredString,
      },
    });

    api.addType(pageType);

    const imageDetailsType = new ObjectType('ImageDetails', {
      definition: {
        height: GraphqlType.int({ isRequired: true }),
        width: GraphqlType.int({ isRequired: true }),
      },
    });
    api.addType(imageDetailsType);

    const fileDetailsType = new ObjectType('FileDetails', {
      definition: {
        size: GraphqlType.string({ isRequired: true }),
        image: imageDetailsType.attribute(),
      },
    });
    api.addType(fileDetailsType);

    const fileType = new ObjectType('File', {
      definition: {
        contentType: GraphqlType.string({ isRequired: true }),
        url: GraphqlType.string({ isRequired: true }),
        fileName: GraphqlType.string({ isRequired: true }),
        details: fileDetailsType.attribute({ isRequired: true }),
      },
    });
    api.addType(fileType);

    const heroImageType = new ObjectType('HeroImage', {
      definition: {
        title: GraphqlType.string({ isRequired: true }),
        description: GraphqlType.string({ isRequired: true }),
        file: fileType.attribute({ isRequired: true }),
      },
    });
    api.addType(heroImageType);

    const postType = new ObjectType('Post', {
      definition: {
        title: GraphqlType.string({ isRequired: true }),
        slug: GraphqlType.string({ isRequired: true }),
        publishDate: GraphqlType.awsDateTime({ isRequired: true }),
        content: GraphqlType.string({ isRequired: true }),
        intro: GraphqlType.string({ isRequired: true }),
        heroImage: heroImageType.attribute(),
      },
    });
    api.addType(postType);

    api.addQuery('getPage', new ResolvableField({
      returnType: pageType.attribute(),
      args: {
        slug: requiredString,
      },
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "index": "GSI1",
          "query":{
            "expression": "sk = :slug AND #data = :slug",
            "expressionNames": {
              "#data": "data"
            },
            "expressionValues": {
              ":slug": $util.dynamodb.toDynamoDBJson("$ctx.args.slug")
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result.items[0])'),
    }));

    api.addQuery('getPost', new ResolvableField({
      returnType: postType.attribute(),
      args: {
        slug: requiredString,
      },
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "index": "GSI1",
          "query":{
            "expression": "sk = :slug AND #data = :slug",
            "expressionNames": {
              "#data": "data"
            },
            "expressionValues": {
              ":slug": $util.dynamodb.toDynamoDBJson("$ctx.args.slug")
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.result.items[0])'),
    }));
  }
}
