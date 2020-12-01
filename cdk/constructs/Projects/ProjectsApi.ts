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
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { Graphql } from '../Api/Graphql';

interface ProjectProps {
  querySource: DynamoDbDataSource
  api: GraphqlApi
  table: ITable
}

export class ProjectsApi extends Construct {
  private readonly fields = new Map<string, ObjectType>();

  private readonly api: GraphqlApi

  constructor(scope: Construct, id: string, props: ProjectProps) {
    super(scope, id);

    const { api, table, querySource } = props;
    this.api = api;

    const mutationFunction = new NodejsFunction(this, 'mutations', {
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantFullAccess(mutationFunction);

    const mutationSource = api.addLambdaDataSource('ProjectsMutationDataSource', mutationFunction);

    const isRequired = true;
    const isList = true;
    const isRequiredList = true;

    const trackingType = this.addType('Tracking', {
      definition: {
        id: GraphqlType.id({ isRequired }),
        startTime: GraphqlType.awsDateTime({ isRequired }),
        endTime: GraphqlType.awsDateTime({ isRequired }),
        description: GraphqlType.string(),
      },
    });

    const trackingConnection = Graphql.createConnection(trackingType, api);

    const contactType = this.addType('Contact', {
      definition: {
        firstName: GraphqlType.string({ isRequired }),
        lastName: GraphqlType.string({ isRequired }),
        email: GraphqlType.string({ isRequired }),
        street: GraphqlType.string({ isRequired }),
        city: GraphqlType.string({ isRequired }),
        zip: GraphqlType.string({ isRequired }),
      },
    });

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
    api.addType(contactInput);

    const resolvableTrackingConnection = new ResolvableField({
      returnType: trackingConnection.attribute({ isRequired }),
      dataSource: querySource,
      args: {
        date: GraphqlType.string(),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
      #set($date = $util.defaultIfNullOrBlank($ctx.args.date, ""))
      {
        "version" : "2018-05-29",
        "operation" : "Query",
        "query":{
          "expression": "pk = :user AND begins_with(sk, :query)",
          "expressionValues": {
            ":user": $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
            ":query": $util.dynamodb.toDynamoDBJson("tracking#$ctx.source.id#$date")
          }
        },
      }
    `),
      responseMappingTemplate: MappingTemplate.fromString(Graphql.connectionResult),
    });

    const projectType = this.addType('Project', {
      definition: {
        id: GraphqlType.id({ isRequired }),
        client: GraphqlType.string({ isRequired }),
        industry: GraphqlType.string({ isRequired }),
        description: GraphqlType.string({ isRequired }),
        startDate: GraphqlType.awsDate({ isRequired }),
        endDate: GraphqlType.awsDate(),
        methodologies: GraphqlType.string({ isRequired, isList, isRequiredList }),
        technologies: GraphqlType.string({ isRequired, isList, isRequiredList }),
        trackings: resolvableTrackingConnection,
        contact: contactType.attribute({ isRequired }),
      },
    });

    const projectConnection = Graphql.createConnection(projectType, api);

    api.addQuery('getProjects', new ResolvableField({
      returnType: projectConnection.attribute({ isRequired }),
      dataSource: querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "query":{
            "expression": "pk = :user AND begins_with(sk, :sk)",
            "expressionValues": {
              ":sk": $util.dynamodb.toDynamoDBJson("project-"),
              ":user": $util.dynamodb.toDynamoDBJson("$ctx.identity.sub")
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(Graphql.connectionResult),
    }));

    api.addQuery('getProject', new ResolvableField({
      returnType: projectType.attribute({ isRequired }),
      dataSource: querySource,
      args: {
        id: GraphqlType.id({ isRequired }),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2018-05-29",
          "operation" : "GetItem",
          "key" : {
            "pk" : $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
            "sk" : $util.dynamodb.toDynamoDBJson("project-$ctx.args.id")
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    }));

    api.addQuery('getTrackings', new ResolvableField({
      returnType: trackingConnection.attribute({ isRequired }),
      dataSource: querySource,
      args: {
        projectId: GraphqlType.string({ isRequired }),
        date: GraphqlType.string(),
      },
      requestMappingTemplate: MappingTemplate.fromString(`
        #set($date = $util.defaultIfNullOrBlank($ctx.args.date, ""))
        #set($projectId = $ctx.args.projectId)
        {
          "version" : "2018-05-29",
          "operation" : "Query",
          "query":{
            "expression": "pk = :user AND begins_with(sk, :query)",
            "expressionValues": {
              ":user": $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
              ":query": $util.dynamodb.toDynamoDBJson("tracking#$projectId#$date")
            }
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(Graphql.connectionResult),
    }));

    // Project Mutations

    const projectInputType = new InputType('ProjectInput', {
      definition: {
        client: GraphqlType.string({ isRequired }),
        industry: GraphqlType.string({ isRequired }),
        description: GraphqlType.string({ isRequired }),
        startDate: GraphqlType.awsDate({ isRequired }),
        endDate: GraphqlType.awsDate(),
        methodologies: GraphqlType.string({
          isList,
          isRequired,
          isRequiredList,
        }),
        technologies: GraphqlType.string({
          isList,
          isRequired,
          isRequiredList,
        }),
        contact: contactInput.attribute({ isRequired }),
      },
    });
    api.addType(projectInputType);

    const projectMutationResponse = Graphql.createMutationResponse(projectType, api);

    api.addMutation('createProject', new ResolvableField({
      returnType: projectMutationResponse.attribute({ isRequired }),
      args: {
        input: projectInputType.attribute({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    api.addMutation('updateProject', new ResolvableField({
      returnType: projectMutationResponse.attribute({ isRequired }),
      args: {
        id: GraphqlType.id({ isRequired }),
        input: projectInputType.attribute({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    api.addMutation('deleteProject', new ResolvableField({
      returnType: projectMutationResponse.attribute({ isRequired }),
      args: {
        id: GraphqlType.id({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    // Tracking Mutations
    const trackingInputType = new InputType('TrackingInput', {
      definition: {
        projectId: GraphqlType.string({ isRequired }),
        startTime: GraphqlType.awsDateTime({ isRequired }),
        endTime: GraphqlType.awsDateTime({ isRequired }),
        description: GraphqlType.string(),
      },
    });
    api.addType(trackingInputType);

    const trackingMutationResponse = Graphql.createMutationResponse(trackingType, api);

    api.addMutation('createTracking', new ResolvableField({
      returnType: trackingMutationResponse.attribute({ isRequired }),
      args: {
        input: trackingInputType.attribute({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    api.addMutation('updateTracking', new ResolvableField({
      returnType: trackingMutationResponse.attribute({ isRequired }),
      args: {
        id: GraphqlType.id({ isRequired }),
        input: trackingInputType.attribute({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    api.addMutation('deleteTracking', new ResolvableField({
      returnType: trackingMutationResponse.attribute({ isRequired }),
      args: {
        id: GraphqlType.id({ isRequired }),
      },
      dataSource: mutationSource,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));
  }

  addType(typeName: string, options: ObjectTypeOptions): ObjectType {
    const type = new ObjectType(typeName, options);
    this.fields.set(typeName, type);
    this.api.addType(type);
    return type;
  }
}
