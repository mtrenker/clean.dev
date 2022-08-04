import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export interface CleanProjectsProps {
  tableName?: string;
}

export class CleanProjects extends Construct {

  constructor (scope: Construct, id: string, props: CleanProjectsProps) {
    super(scope, id);
    const { tableName } = props;
    const trpcFunction = new NodejsFunction(this, 'server', {
      environment: {
        TABLE_NAME: tableName || '',
      },
    });

    if (tableName) {
      const table = Table.fromTableName(this, 'CleanProjectsTable', tableName);
      table.grantReadWriteData(trpcFunction);
    }

    const httpApi = new HttpApi(this, 'HttpApi');
    httpApi.addRoutes({
      path: '/',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('TRCP', trpcFunction),
    });
  }
}
