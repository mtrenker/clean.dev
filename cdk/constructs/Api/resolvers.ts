import {
  DynamoDbDataSource, LambdaDataSource, MappingTemplate, Resolver,
} from '@aws-cdk/aws-appsync';

interface QueryResolver {
  (dataSource: DynamoDbDataSource): Resolver
}

interface MutationResolver {
  (dataSource: LambdaDataSource, fieldName: string): Resolver
}

const connectionResult = `
  {
    "totalCount": $util.toJson($ctx.result.scannedCount),
    "edges": $util.toJson($ctx.result.items),
    "cursor": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
  }
`;

/**
 * Queries
 */

export const createMeResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Query',
  fieldName: 'me',
  requestMappingTemplate: MappingTemplate.fromString(`
    {
      "version" : "2018-05-29",
      "operation" : "GetItem",
      "key" : {
          "pk" : $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
          "sk" : $util.dynamodb.toDynamoDBJson("$ctx.identity.sub")
      }
    }
  `),
  responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
});

export const createUserProjectsResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'User',
  fieldName: 'projects',
  requestMappingTemplate: MappingTemplate.fromString(`
    {
      "version" : "2018-05-29",
      "operation" : "Query",
      "query":{
        "expression": "pk = :user AND begins_with(sk, :sk)",
        "expressionValues": {
          ":user": $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
          ":sk": $util.dynamodb.toDynamoDBJson("project-")
        }
      },
    }
  `),
  responseMappingTemplate: MappingTemplate.fromString(connectionResult),
});

export const createProjectTrackingsResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Project',
  fieldName: 'trackings',
  requestMappingTemplate: MappingTemplate.fromString(`
    {
      "version" : "2018-05-29",
      "operation" : "Query",
      "query":{
        "expression": "pk = :user AND begins_with(sk, :sk)",
        "expressionValues": {
          ":user": $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
          ":sk": $util.dynamodb.toDynamoDBJson("tracking#$ctx.source.id#")
        }
      },
    }
  `),
  responseMappingTemplate: MappingTemplate.fromString(connectionResult),
});

export const createPageResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Query',
  fieldName: 'getPage',
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
});

export const createGetProjectsResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Query',
  fieldName: 'getProjects',
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
  responseMappingTemplate: MappingTemplate.fromString(connectionResult),
});

export const createGetProjectResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Query',
  fieldName: 'getProject',
  requestMappingTemplate: MappingTemplate.fromString(`
  {
    "version" : "2018-05-29",
    "operation" : "GetItem",
    "key" : {
      "pk" : $util.dynamodb.toDynamoDBJson("$ctx.identity.sub"),
      "sk" : $util.dynamodb.toDynamoDBJson("project-$ctx.args.query.projectId")
    }
  }
`),
  responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
});

export const createGetTrackingsResolver: QueryResolver = (dataSource) => dataSource.createResolver({
  typeName: 'Query',
  fieldName: 'getTrackings',
  requestMappingTemplate: MappingTemplate.fromString(`
    #set($date = $util.defaultIfNullOrBlank($ctx.args.query.date, ""))
    #set($projectId = $ctx.args.query.projectId)
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
  responseMappingTemplate: MappingTemplate.fromString(connectionResult),
});

/**
 * Mutations
 */

export const createMutationResolver: MutationResolver = (mutationSource, fieldName) => mutationSource.createResolver({
  typeName: 'Mutation',
  fieldName,
  requestMappingTemplate: MappingTemplate.lambdaRequest(),
  responseMappingTemplate: MappingTemplate.lambdaResult(),
});
