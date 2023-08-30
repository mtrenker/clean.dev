import { Stack, StackProps } from "aws-cdk-lib";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export interface CertStackProps extends StackProps {
  domainName: string;
}

export class CertStack extends Stack {

  webCertificate: Certificate;

  constructor(scope: Construct, id: string, props: CertStackProps) {
    super(scope, id, props);

    const { domainName } = props;

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName,
    });

    this.webCertificate = new Certificate(this, "WebCertificate", {
      domainName,
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
