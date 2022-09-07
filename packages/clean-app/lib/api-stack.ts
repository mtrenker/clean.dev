import { AuthorizationType, DynamoDbDataSource, GraphqlApi, GraphqlType, MappingTemplate, ObjectType, ResolvableField } from '@aws-cdk/aws-appsync-alpha';
import { Stack, Fn } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ApiStack extends Stack {
  api: GraphqlApi;
  querySource: DynamoDbDataSource;
  projectType: ObjectType;
  projectHightlightType: ObjectType;
  mutationSource: any;

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
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        hightlights: this.projectHightlightType.attribute({ isRequired: true, isRequiredList: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
      },
    });
    this.api.addType(this.projectType);
  }

  setupQueries (): void {
    this.api.addQuery('projects', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true, isRequiredList: true }),
      dataSource: this.querySource,
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    }));
  }

  setupMutations (): void {

    this.api.addMutation('createProject', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true }),
      dataSource: this.mutationSource,
      args: {
        position: GraphqlType.string({ isRequired: true }),
        summary: GraphqlType.string({ isRequired: true }),
        hightlights: this.projectHightlightType.attribute({ isRequired: true, isRequiredList: true }),
        startDate: GraphqlType.awsDate(),
        endDate: GraphqlType.awsDate(),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));
  }
}
