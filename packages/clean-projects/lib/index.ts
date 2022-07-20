import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface CleanProjectsProps {
  tableName?: string;
}

export class CleanProjects extends Construct {

  constructor (scope: Construct, id: string, { tableName }: CleanProjectsProps) {
    super(scope, id);
    // const table = Table.fromTableName(this, 'CleanProjectsTable', tableName);
    const trpcFunction = new NodejsFunction(this, 'CleanProjectsFunction', {
      entry: './trcp-server.ts',
    });
    // table.grantReadWriteData(trpcFunction);
    // Define construct contents here

    const httpApi = new HttpApi(this, 'HttpApi');
    httpApi.addRoutes({
      path: '/trpc',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('TRCP', trpcFunction),
    });
  }
}
