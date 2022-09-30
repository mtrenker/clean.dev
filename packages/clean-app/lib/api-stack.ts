import {
  AuthorizationType,
  DynamoDbDataSource,
  GraphqlApi,
  GraphqlType,
  InputType,
  LambdaDataSource,
  MappingTemplate,
  ObjectType,
  ResolvableField,
} from '@aws-cdk/aws-appsync-alpha';
import { Stack, Fn } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ApiStack extends Stack {
  api: GraphqlApi;
  querySource: DynamoDbDataSource;
  mutationSource: LambdaDataSource;
  projectType: ObjectType;
  projectInputType: InputType;
  contactType: ObjectType;
  contactInputType: InputType;
  projectCategoryType: ObjectType;
  projectCategoryInputType: InputType;
  projectHighlightType: ObjectType;
  highlightInputType: InputType;
  trackingType: ObjectType;
  trackingInputType: InputType;

  constructor (scope: Construct, id: string) {
    super(scope, id);

    const tableName = Fn.importValue('InventoryTableName');
    const userPoolId = Fn.importValue('UserPoolId');
    const table = Table.fromTableName(this, 'InventoryTable', tableName);

    this.api = new GraphqlApi(this, 'Api', {
      name: 'CleanApi',
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: UserPool.fromUserPoolId(this, 'UserPool', userPoolId) },
        },
      },
    });
    const mutationLambda = new NodejsFunction (this, 'mutations', { environment: { TABLE_NAME: tableName } });
    table.grantReadWriteData(mutationLambda);

    this.querySource = this.api.addDynamoDbDataSource('QuerySource', table);
    this.mutationSource = this.api.addLambdaDataSource('ProjectMutations', mutationLambda);

    this.setupTypes();
    this.setupQueries();
    this.setupMutations();

    new StringParameter(this, 'GraphqlUrlParam', {
      stringValue: this.api.graphqlUrl,
      parameterName: 'graphqlUrl',
    });
  }

  setupTypes (): void {

    this.contactType = new ObjectType('Contact', {
      definition: {
        company: GraphqlType.string(),
        firstName: GraphqlType.string(),
        lastName: GraphqlType.string(),
        email: GraphqlType.string(),
        street: GraphqlType.string(),
        city: GraphqlType.string(),
        zip: GraphqlType.string(),
        country: GraphqlType.string(),
      },
    });
    this.api.addType(this.contactType);

    this.contactInputType = new InputType('ContactInput', {
      definition: {
        company: GraphqlType.string(),
        firstName: GraphqlType.string(),
        lastName: GraphqlType.string(),
        email: GraphqlType.string(),
        street: GraphqlType.string(),
        city: GraphqlType.string(),
        zip: GraphqlType.string(),
        country: GraphqlType.string(),
      },
    });
    this.api.addType(this.contactInputType);

    this.projectCategoryType = new ObjectType('ProjectCategory', {
      definition: {
        name: GraphqlType.string({ isRequired: true }),
        color: GraphqlType.string(),
        rate: GraphqlType.float(),
      },
    });
    this.api.addType(this.projectCategoryType);

    this.projectHighlightType = new ObjectType('ProjectHighlight', {
      definition: {
        description: GraphqlType.string({ isRequired: true }),
      },
    });
    this.api.addType(this.projectHighlightType);


    this.projectCategoryInputType = new InputType('ProjectCategoryInput', {
      definition: {
        name: GraphqlType.string({ isRequired: true }),
        color: GraphqlType.string(),
        rate: GraphqlType.float(),
      },
    });
    this.api.addType(this.projectCategoryInputType);

    this.highlightInputType = new InputType('HighlightInput', {
      definition: {
        description: GraphqlType.string({ isRequired: true }),
      },
    });
    this.api.addType(this.highlightInputType);

    this.trackingType = new ObjectType('Tracking', {
      definition: {
        category: GraphqlType.string(),
        startTime: GraphqlType.awsDateTime({ isRequired: true }),
        endTime: GraphqlType.awsDateTime(),
        summary: GraphqlType.string(),
      },
    });
    this.api.addType(this.trackingType);

    this.trackingInputType = new InputType('TrackingInput', {
      definition: {
        projectId: GraphqlType.string({ isRequired: true }),
        category: GraphqlType.string(),
        startTime: GraphqlType.awsDateTime({ isRequired: true }),
        endTime: GraphqlType.awsDateTime(),
        summary: GraphqlType.string(),
      },
    });
    this.api.addType(this.trackingInputType);

    this.projectType = new ObjectType('Project', {
      definition: {
        id: GraphqlType.id({ isRequired: true }),
        client: GraphqlType.string({ isRequired: true }),
        location: GraphqlType.string(),
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        highlights: this.projectHighlightType.attribute({ isList: true, isRequiredList: true, isRequired: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
        featured: GraphqlType.boolean({ isRequired : true }),
        categories: this.projectCategoryType.attribute({ isList: true, isRequiredList: true, isRequired: true }),
        contact: this.contactType.attribute(),
        trackings: new ResolvableField({
          returnType: this.trackingType.attribute({ isList: true, isRequired: true, isRequiredList: true }),
          dataSource: this.querySource,
          requestMappingTemplate: MappingTemplate.fromString(`
            {
              "version" : "2017-02-28",
              "operation" : "Query",
              "query" : {
                "expression" : "pk = :userId and begins_with(sk, :tracking)",
                "expressionValues" : {
                  ":userId" : $util.dynamodb.toDynamoDBJson("USER#$context.identity.sub"),
                  ":tracking" : $util.dynamodb.toDynamoDBJson("TRACKING#$context.source.id")
                }
              }
            }
          `),
          responseMappingTemplate: MappingTemplate.fromString(`
            $util.toJson($context.result.items)
          `),
        }),
      },
    });
    this.api.addType(this.projectType);

    this.projectInputType = new InputType('ProjectInput', {
      definition: {
        client: GraphqlType.string({ isRequired: true }),
        location: GraphqlType.string(),
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        highlights: this.highlightInputType.attribute({ isList: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
        featured: GraphqlType.boolean(),
        contact: this.contactInputType.attribute(),
        categories: this.projectCategoryInputType.attribute({ isList: true }),
      },
    });
    this.api.addType(this.projectInputType);
  }

  setupQueries (): void {
    this.api.addQuery('projects', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true, isRequiredList: true }),
      dataSource: this.querySource,
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation" : "Query",
          "query" : {
            "expression" : "pk = :userId and begins_with(sk, :project)",
            "expressionValues" : {
              ":userId" : $util.dynamodb.toDynamoDBJson("USER#$context.identity.sub"),
              ":project" : $util.dynamodb.toDynamoDBJson("PROJECT#")
            }
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        $util.toJson($context.result.items)
      `),
    }));
  }

  setupMutations (): void {

    this.api.addMutation('createProject', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        input: this.projectInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    this.api.addMutation('updateProject', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        id: GraphqlType.id({ isRequired: true }),
        input: this.projectInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    this.api.addMutation('removeProject', new ResolvableField({
      returnType: GraphqlType.string({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        id: GraphqlType.id({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    this.api.addMutation('createTracking', new ResolvableField({
      returnType: this.trackingType.attribute({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        input: this.trackingInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    this.api.addMutation('removeTracking', new ResolvableField({
      returnType: GraphqlType.string({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        input: this.trackingInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));
  }
}
