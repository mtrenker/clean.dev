import { AuthorizationType, DynamoDbDataSource, GraphqlApi, GraphqlType, InputType, LambdaDataSource, MappingTemplate, ObjectType, ResolvableField } from '@aws-cdk/aws-appsync-alpha';
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
  projectHightlightType: ObjectType;
  projectInputType: InputType;

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
          userPoolConfig: {
            userPool: UserPool.fromUserPoolId(this, 'UserPool', userPoolId),
          },
        },
      },
    });
    const mutationLambda = new NodejsFunction (this, 'mutations', {
      environment: {
        TABLE_NAME: tableName,
      },
    });
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

    this.projectHightlightType = new ObjectType('ProjectHightlight', {
      definition: {
        title: GraphqlType.string({ isRequired: true }),
        description: GraphqlType.string({ isRequired: true }),
      },
    });
    this.api.addType(this.projectHightlightType);

    this.projectType = new ObjectType('Project', {
      definition: {
        id: GraphqlType.id({ isRequired: true }),
        client: GraphqlType.string({ isRequired: true }),
        location: GraphqlType.string(),
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        hightlights: this.projectHightlightType.attribute({ isRequired: true, isRequiredList: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
        featured: GraphqlType.boolean(),
      },
    });
    this.api.addType(this.projectType);

    this.projectInputType = new InputType('ProjectInput', {
      definition: {
        client: GraphqlType.string({ isRequired: true }),
        location: GraphqlType.string(),
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        hightlights: GraphqlType.string({ isList: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
        featured: GraphqlType.boolean(),
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
        project: this.projectInputType.attribute({ isRequired: true }),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));

    this.api.addMutation('updateProject', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        id: GraphqlType.id({ isRequired: true }),
        project: this.projectInputType.attribute({ isRequired: true }),
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

  }
}
