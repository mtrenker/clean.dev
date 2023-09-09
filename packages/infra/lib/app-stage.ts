import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebStack } from './web-stack';
import { CertStack } from './cert-stack';
import { MonitoringStack } from './monitoring-stack';

export class AppStage extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new MonitoringStack(this, 'MonitoringStack');

    const certStack = new CertStack(this, 'CertStack', {
      crossRegionReferences: true,
      env: {
        region: 'us-east-1',
      },
      domainName: 'clean.dev',
    });

    const webStack = new WebStack(this, 'WebStack', {
      crossRegionReferences: true,
      webCertificateArn: certStack.webCertificate.certificateArn,
    });

    webStack.addDependency(certStack);
  }
}
