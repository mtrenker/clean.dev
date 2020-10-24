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
  }
}
