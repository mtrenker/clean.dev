import {
  Stack, StackProps, RemovalPolicy, App,
} from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { GraphQLApi, MappingTemplate } from '@aws-cdk/aws-appsync';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

interface TrackStackProps extends StackProps {
  graphQLApi: GraphQLApi;
}

export class TrackStack extends Stack {
  constructor(scope: App, id: string, props: TrackStackProps) {
    super(scope, id, props);

    const { graphQLApi } = props;

    const trackingTable = new Table(this, 'TrackingTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sort_key',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const mutationRole = new Role(this, 'MutationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });

    const mutationFunction = new Function(this, 'MutationFunction', {
      code: Code.fromAsset('cdk/resources/lambda/track-mutation'),
      handler: 'mutation.handler',
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: trackingTable.tableName,
      },
      role: mutationRole,
    });

    trackingTable.grantReadWriteData(mutationRole);

    graphQLApi.addDynamoDbDataSource('Query', 'Query', trackingTable);
    const mutationDataSource = graphQLApi.addLambdaDataSource('Mutation', 'Mutation', mutationFunction);

    mutationDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'saveProject',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
  }
}
