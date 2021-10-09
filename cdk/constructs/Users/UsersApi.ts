import { Construct } from '@aws-cdk/core';
import {
  DynamoDbDataSource,
  GraphqlApi,
  GraphqlType,
  InputType,
  MappingTemplate,
  ObjectType,
  ObjectTypeOptions,
  ResolvableField,
} from '@aws-cdk/aws-appsync';
import { ITable } from '@aws-cdk/aws-dynamodb';

interface ProjectProps {
  querySource: DynamoDbDataSource
  api: GraphqlApi
  table: ITable
}

export class UsersApi extends Construct {
  private readonly fields = new Map<string, ObjectType>();

  private readonly api: GraphqlApi

  constructor(scope: Construct, id: string, props: ProjectProps) {
    super(scope, id);
    const isRequired = true;

    const { api, querySource } = props;
    this.api = api;

    const contactType = new ObjectType('Contact', {
      definition: {
        firstName: GraphqlType.string({ isRequired }),
        lastName: GraphqlType.string({ isRequired }),
        email: GraphqlType.string({ isRequired }),
        street: GraphqlType.string({ isRequired }),
        city: GraphqlType.string({ isRequired }),
        zip: GraphqlType.string({ isRequired }),
      },
    });

    const userType = new ObjectType('User', {
      definition: {
        id: GraphqlType.id({ isRequired: true }),
        contact: contactType.attribute(),
      },
    });

    api.addType(userType);

    api.addQuery('me', new ResolvableField({
      returnType: userType.attribute({ isRequired: true }),
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "GetItem",
          "key" : {
            "pk" : $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub"),
            "sk" : $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub")
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "id" : $util.toJson($context.result.id),
          "contact" : $util.toJson($context.result.contact)
        }
      `),
    }));

    const contactInput = new InputType('ContactInput', {
      definition: {
        firstName: GraphqlType.string({ isRequired }),
        lastName: GraphqlType.string({ isRequired }),
        email: GraphqlType.string({ isRequired }),
        street: GraphqlType.string({ isRequired }),
        city: GraphqlType.string({ isRequired }),
        zip: GraphqlType.string({ isRequired }),
      },
    });

    api.addMutation('updateContact', new ResolvableField({
      returnType: contactType.attribute(),
      args: {
        contact: contactInput.attribute({ isRequired }),
      },
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "PutItem",
          "key" : {
            "pk" : $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub"),
            "sk" : $util.dynamodb.toDynamoDBJson("user-$ctx.identity.sub")
          },
          "attributeValues": {
            "contact": $util.dynamodb.toDynamoDBJson("$ctx.args.contact")
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        {
          "contact": $util.dynamodb.toDynamoDBJson("$ctx.args.contact")
        }
      `),
    }));
  }
}
