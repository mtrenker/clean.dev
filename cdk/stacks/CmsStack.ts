import {
  Stack, App, StackProps, Fn,
} from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Contentful } from '../constructs/Contentful/Contentful';

export class CmsStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const inventoryName = Fn.importValue('inventoryTableName');
    const table = Table.fromTableName(this, 'Table', inventoryName) as Table;

    const spaceId = StringParameter.fromStringParameterName(
      this,
      'ContentfulSpaceId',
      'cleanDevContentfulSpaceId',
    ).stringValue;

    const apiKey = StringParameter.fromStringParameterName(
      this,
      'ContentfulApiKey',
      'cleanDevContentfulApiToken',
    ).stringValue;

    new Contentful(this, 'Contentful', {
      apiKey,
      spaceId,
      table,
    });
  }
}
