import {
  Directive,
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
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        title: requiredString,
        slug: requiredString,
        content: requiredString,
        layout: requiredString,
      },
    });

    api.addType(pageType);

    const imageDetailsType = new ObjectType('ImageDetails', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        height: GraphqlType.int({ isRequired: true }),
        width: GraphqlType.int({ isRequired: true }),
      },
    });
    api.addType(imageDetailsType);

    const fileDetailsType = new ObjectType('FileDetails', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        size: GraphqlType.string({ isRequired: true }),
        image: imageDetailsType.attribute(),
      },
    });
    api.addType(fileDetailsType);

    const fileType = new ObjectType('File', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        contentType: GraphqlType.string({ isRequired: true }),
        url: GraphqlType.string({ isRequired: true }),
        fileName: GraphqlType.string({ isRequired: true }),
        details: fileDetailsType.attribute({ isRequired: true }),
      },
    });
    api.addType(fileType);

    const imageType = new ObjectType('Image', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        title: GraphqlType.string({ isRequired: true }),
        description: GraphqlType.string(),
        file: fileType.attribute({ isRequired: true }),
      },
    });
    api.addType(imageType);

    const authorType = new ObjectType('Author', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        name: GraphqlType.string({ isRequired: true }),
        avatar: imageType.attribute(),
      },
    });
    api.addType(authorType);

    const postType = new ObjectType('Post', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        title: GraphqlType.string({ isRequired: true }),
        slug: GraphqlType.string({ isRequired: true }),
        publishDate: GraphqlType.awsDateTime({ isRequired: true }),
        content: GraphqlType.string(),
        intro: GraphqlType.string(),
        heroImage: imageType.attribute(),
        author: authorType.attribute({ isRequired: true }),
      },
    });
    api.addType(postType);

    api.addQuery('getPage', new ResolvableField({
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
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
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
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

    const blogOverviewType = new ObjectType('Blog', {
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      definition: {
        posts: postType.attribute({ isList: true, isRequired: true, isRequiredList: true }),
      },
    });
    api.addType(blogOverviewType);

    api.addQuery('getBlog', new ResolvableField({
      directives: [Directive.apiKey(), Directive.cognito('Admins')],
      returnType: blogOverviewType.attribute({ isRequired: true }),
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
      {
        "version" : "2018-05-29",
        "operation" : "GetItem",
        "key" : {
          "pk" : $util.dynamodb.toDynamoDBJson("blog"),
          "sk" : $util.dynamodb.toDynamoDBJson("blog-overview")
        }
      }
    `),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    }));
  }
}
