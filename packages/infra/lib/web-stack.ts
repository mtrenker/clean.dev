import { Stack, StackProps } from "aws-cdk-lib";
import { NextApp } from "@cleandev/cdk-next-app";
import { NextBlog } from "@cleandev/cdk-next-blog";
import { Construct } from "constructs";

export interface WebStackProps extends StackProps {
  webCertificateArn: string;
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const { webCertificateArn } = props;


    new NextApp(this, "NextApp", {
      domainName: "clean.dev",
      nextDir: "apps/web",
      certArn: webCertificateArn,
    });
    
    new NextBlog(this, "NextBlog");
  }
}
