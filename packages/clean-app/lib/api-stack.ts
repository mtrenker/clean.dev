import { AuthorizationType, DynamoDbDataSource, GraphqlApi, GraphqlType, MappingTemplate, ObjectType, ResolvableField } from "@aws-cdk/aws-appsync-alpha";
import { Stack, Fn, Expiration } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class ApiStack extends Stack {
  api: GraphqlApi;
  querySource: DynamoDbDataSource;
  projectType: ObjectType;
  projectHightlightType: ObjectType;

  constructor (scope: Construct, id: string) {
    super(scope, id);

    const tableName = Fn.importValue('InventoryTableName');
    const table = Table.fromTableName(this, 'InventoryTable', tableName);

    this.api = new GraphqlApi(this, 'Api', {
      name: 'CleanApi',
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.atDate(new Date('2022-12-31')),
          },
        },
      },
    });

    this.querySource = this.api.addDynamoDbDataSource('QuerySource', table);

    this.setupTypes();
    this.setupResolvers();
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

  setupResolvers (): void {
    this.api.addQuery('projects', new ResolvableField({
      returnType: this.projectType.attribute({ isRequired: true, isRequiredList: true }),
      dataSource: this.querySource,
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    }));
  }
}
