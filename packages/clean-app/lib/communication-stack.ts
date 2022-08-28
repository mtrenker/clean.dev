import { GraphqlApi, GraphqlType, MappingTemplate, ResolvableField } from '@aws-cdk/aws-appsync-alpha';
import { Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
      mailFromDomain: 'mail.clean.dev',
    });

    const contactLambda = new NodejsFunction(this, 'mailer', {
      environment: {
        MAIL_TO: Secret.fromSecretNameV2(this, 'MailTo', 'mail/admin').secretValue.unsafeUnwrap(),
      },
    });

    contactLambda.addToRolePolicy( new PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
      effect: Effect.ALLOW,
    }));


    const contactResource = api.addLambdaDataSource('ContactLambda', contactLambda);
    api.addMutation('contact', new ResolvableField({
      returnType: GraphqlType.string(),
      dataSource: contactResource,
      args: {
        name: GraphqlType.string(),
        email: GraphqlType.string(),
        message: GraphqlType.string(),
      },
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    }));
  }
}
