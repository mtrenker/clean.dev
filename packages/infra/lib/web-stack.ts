import { Stack, StackProps } from "aws-cdk-lib";
import { NextApp } from "@cleandev/cdk-next-app";
import { NextBlog } from "@cleandev/cdk-next-blog";
import { Construct } from "constructs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface WebStackProps extends StackProps {
  webCertificateArn: string;
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const { webCertificateArn } = props;

    const webApp = new NextApp(this, "NextApp", {
      domainName: "clean.dev",
      nextDir: "apps/web",
      certArn: webCertificateArn,
    });

    const blog = new NextBlog(this, "NextBlog");

    webApp.serverFunction.addEnvironment(
      "BLOG_ENDPOINT",
      StringParameter.valueForStringParameter(this, '/clean/blog/api-endpoint')
    );

    webApp.serverFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        blog.draftSecret.secretArn,
        blog.apiSecret.secretArn,
      ],
    }));
  }
}
