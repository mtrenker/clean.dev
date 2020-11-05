import { GraphqlApi } from '@aws-cdk/aws-appsync';
import { Construct } from '@aws-cdk/core';

interface AgileApiProps {
  api: GraphqlApi
}

export class AgileApi extends Construct {
  constructor(scope: Construct, id: string, props: AgileApiProps) {
    super(scope, id);

    const { api } = props;
  }
}
