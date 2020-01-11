import { Construct, Stack, RemovalPolicy, CfnOutput } from "@aws-cdk/core";
import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import {
  HostedZone,
  AaaaRecord,
  AddressRecordTarget,
  ARecord
} from "@aws-cdk/aws-route53";
import {
  CloudFrontWebDistribution,
  ViewerCertificate,
  SecurityPolicyProtocol,
  SSLMethod
} from "@aws-cdk/aws-cloudfront";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

export class Site extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const cvBucket = new Bucket(this, "CVBucket", {
      bucketName: "clean.dev",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    new CfnOutput(this, "BucketUrl", {
      value: cvBucket.bucketWebsiteUrl
    });

    new BucketDeployment(this, "CVDeployment", {
      destinationBucket: cvBucket,
      sources: [Source.asset("./dist/cdk/static/cd-app/dist")]
    });

    const [recordName, domainName] = ["", "clean.dev"];

    const zone = HostedZone.fromLookup(this, "Zone", { domainName });

    const certificate = Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:us-east-1:322969600175:certificate/bc6a2d6b-051a-417b-ac0d-54ec70a3263f"
    );

    const distribution = new CloudFrontWebDistribution(this, "CloudFront", {
      originConfigs: [
        {
          s3OriginSource: { s3BucketSource: cvBucket },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: ["clean.dev"],
        securityPolicy: SecurityPolicyProtocol.TLS_V1,
        sslMethod: SSLMethod.SNI
      })
    });

    new AaaaRecord(this, "Alias", {
      zone,
      target: AddressRecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });

    new ARecord(this, "AliasV4", {
      zone,
      target: AddressRecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });
  }
}
