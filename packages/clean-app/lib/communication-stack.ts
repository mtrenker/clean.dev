import { GraphqlApi, MappingTemplate } from '@aws-cdk/aws-appsync-alpha';
import { Stack } from 'aws-cdk-lib';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

interface CommunicationStackProps {
  domainName: string;
  api: GraphqlApi;
}

export class ComminucationStack extends Stack {
  constructor (scope: Construct, id: string, props: CommunicationStackProps) {
    super(scope, id);

    const { domainName, api } = props;

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    });

    new EmailIdentity(this, 'EmailIdentity', {
      identity: Identity.publicHostedZone(hostedZone),
    });

    const contactLambda = new NodejsFunction(this, 'mailer', {
      environment: {
        MAIL_TO: Secret.fromSecretNameV2(this, 'MailTo', 'mail/admin').secretValue.unsafeUnwrap(),
      },
    });
    contactLambda.addPermission('SendEmail', {
      principal: new ServicePrincipal('ses.amazonaws.com'),
      action: 'ses:SendEmail',
    });

    const contactResource = api.addLambdaDataSource('ContactLambda', contactLambda);
    contactResource.createResolver({
      typeName: 'Mutation',
      fieldName: 'contact',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
  }
}
