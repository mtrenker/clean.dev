import * as path from "path";
import * as child_process from 'child_process';
import { Construct } from "constructs";
import { Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { Alias, Architecture, Code, Function, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from "aws-cdk-lib/aws-s3";
import { HttpOrigin, OriginGroup, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AllowedMethods, BehaviorOptions, CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior, CachedMethods, Distribution, OriginRequestCookieBehavior, OriginRequestHeaderBehavior, OriginRequestPolicy, OriginRequestQueryStringBehavior, ResponseHeadersPolicy, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { Certificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, ARecordProps, AaaaRecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { BucketDeployment, CacheControl, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { LambdaApplication, LambdaDeploymentConfig, LambdaDeploymentGroup } from "aws-cdk-lib/aws-codedeploy";
import { CodeBuildAction, CodeDeployServerDeployAction, CodeStarConnectionsSourceAction, S3DeployAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Artifacts, BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild";

const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();
const DEFAULT_STATIC_STALE_WHILE_REVALIDATE = Duration.days(1).toSeconds();

export interface NextAppProps {
  nextDir: string;
  domainName: string;
  certArn: string;
  connectionArn: string;
  owner: string;
  repo: string;
  branch: string;
}

export class NextApp extends Construct {

  /** the region where the app is deployed */
  readonly region: string;

  /** the domain name of the app */
  readonly domainName: string;

  /** relative path to the next.js app package */
  readonly relativeNextPath: string;

  /** relative path to the open-next output */
  readonly relativeOpenNextPath: string;

  /** the bucket that serves static assets */
  readonly staticBucket: Bucket;

  /** the bucket that serves cache */
  readonly cacheBucket: Bucket;

  /** the bucket that serves optimized images */
  readonly imageBucket: Bucket;


  /** the queue that triggers revalidation */
  readonly revalidationQueue: Queue;

  /** the lambda function that serves the next.js app */
  readonly serverFunction: Function;

  /** the lambda function that revalidates the next.js app */
  readonly revalidationFunction: Function;

  /** the lambda function that optimizes images */
  readonly imageOptimizationFunction: Function;

  /** the lambda function that warms up the next.js app */
  readonly warmerFunction: Function;

  /** the certificate for the domain */
  readonly certificate: ICertificate;

  /** the cloudfront distribution that serves the next.js app */
  readonly distribution: Distribution;

  /** the deployment of the static assets */
  // readonly assetDeployment: BucketDeployment;

  /** the deployment of the cache */
  // readonly cacheDeployment: BucketDeployment;


  constructor(scope: Construct, id: string, props: NextAppProps) {
    super(scope, id);
    const { nextDir, domainName, certArn, connectionArn, owner, repo, branch } = props;

    this.domainName = domainName;
    this.region = process.env.CDK_DEFAULT_REGION as string;
    this.relativeNextPath = `../../${nextDir}`;
    this.relativeOpenNextPath = `${this.relativeNextPath}/.open-next`;

    // this.buildApp();
    this.staticBucket = this.prepareStaticBucket();
    this.imageBucket = this.prepareImageBucket();
    this.cacheBucket = this.prepareCacheBucket();

    this.revalidationQueue = this.prepareRevalidationQueue();

    this.imageOptimizationFunction = this.prepareImageOptimizationFunction();
    this.serverFunction = this.prepareServerFunction();
    this.revalidationFunction = this.prepareRevalidationFunction();
    this.warmerFunction = this.prepareWarmerFunction();

    this.certificate = this.prepareCertificate(certArn);

    this.distribution = this.prepareDistribution();

    this.prepareDeployment(connectionArn, owner, repo, branch);

    // this.assetDeployment = this.prepareAssetDeployment();
    // this.cacheDeployment = this.prepareCacheDeployment();

    // domain config
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    });

    const recordProps: ARecordProps = {
      recordName: domainName,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    };
    new ARecord(this, 'ARecord', recordProps);
    new AaaaRecord(this, 'AaaaRecord', recordProps);

    // queue config
    this.revalidationQueue.grantSendMessages(this.serverFunction);
    this.revalidationQueue.grantConsumeMessages(this.revalidationFunction);
    this.revalidationFunction.addEventSource(new SqsEventSource(this.revalidationQueue));

    // warmer config

    this.serverFunction.grantInvoke(this.warmerFunction);

    // bucket config
    this.cacheBucket.grantReadWrite(this.serverFunction);
    this.imageBucket.grantReadWrite(this.imageOptimizationFunction);
  }

  private prepareStaticBucket() {
    return new Bucket(this, 'StaticBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  private prepareImageBucket() {
    return new Bucket(this, 'ImageBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  private prepareCacheBucket() {
    return new Bucket(this, 'CacheBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  private prepareRevalidationQueue() {
    return new Queue(this, 'RevalidationQueue', {
      fifo: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  private prepareImageOptimizationFunction() {
    return new Function(this, 'ImageFunction', {
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      code: Code.fromInline(`
        export const handler = async () => {
          console.log('Hello World from the image-optimization-function');
        };
      `),
      handler: 'index.handler',
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        BUCKET_NAME: this.imageBucket.bucketName,
      },
    });
  }

  private prepareServerFunction() {
    return new Function(this, 'ServerFunction', {
      runtime: Runtime.NODEJS_18_X,
      memorySize: 1024,
      timeout: Duration.seconds(10),
      code: Code.fromInline(`
        export const handler = async () => {
          console.log('Hello World from the server-function');
        };
      `),
      handler: 'index.handler',
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        CACHE_BUCKET_NAME: this.cacheBucket.bucketName,
        CACHE_BUCKET_REGION: this.region,
        REVALIDATION_QUEUE_URL: this.revalidationQueue.queueUrl,
        REVALIDATION_QUEUE_REGION: this.region,
      },
    });
  }

  private prepareRevalidationFunction() {
    return new Function(this, 'RevalidationFunction', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromInline(`
        export const handler = async () => {
          console.log('Hello World from the revalidation-function');
        };
      `),
      handler: 'index.handler',
      logRetention: RetentionDays.ONE_WEEK,
    });
  }

  private prepareWarmerFunction() {
    return new Function(this, 'WarmerFunction', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromInline(`
        export const handler = async () => {
          console.log('Hello World from the warmer-function');
        };
      `),
      handler: 'index.handler',
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        FUNCTION_NAME: this.serverFunction.functionName,
        CONCURRENCY: '1'
      },
    });
  }

  private prepareCertificate(certArn: string) {
    return Certificate.fromCertificateArn(this, 'Certificate', certArn);
  }

  private prepareDistribution() {
    const serverFunctionUrl = this.serverFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE
    });
    const imageFunctionUrl = this.imageOptimizationFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE
    });
    const serverOrigin = new HttpOrigin(Fn.parseDomainName(serverFunctionUrl.url));
    const imageOrigin = new HttpOrigin(Fn.parseDomainName(imageFunctionUrl.url));
    const staticOrigin = new S3Origin(this.staticBucket);

    const fallbackGroup = new OriginGroup({
      primaryOrigin: serverOrigin,
      fallbackOrigin: staticOrigin,
      fallbackStatusCodes: [403, 404, 503],
    });

    const lambdaOriginRequestPolicy = new OriginRequestPolicy(this, 'LambdaOriginRequestPolicy', {
      cookieBehavior: OriginRequestCookieBehavior.all(),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
      headerBehavior: OriginRequestHeaderBehavior.denyList('host'),
    });

    const lambdaBehavior: BehaviorOptions = {
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      origin: serverOrigin,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      originRequestPolicy: lambdaOriginRequestPolicy,
      compress: true,
      cachePolicy: CachePolicy.CACHING_DISABLED,
    };

    return new Distribution(this, 'Distribution', {
      domainNames: [this.domainName],
      certificate: this.certificate,
      defaultRootObject: '',
      defaultBehavior: {
        origin: fallbackGroup,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        cachePolicy: new CachePolicy(this, 'DefaultCachePolicy', {
          queryStringBehavior: CacheQueryStringBehavior.all(),
          headerBehavior: CacheHeaderBehavior.allowList('rsc', 'next-router-prefetch', 'next-router-state-tree'),
          cookieBehavior: CacheCookieBehavior.all(),
          defaultTtl: Duration.seconds(0),
          maxTtl: Duration.days(365),
          minTtl: Duration.seconds(0),
          enableAcceptEncodingBrotli: true,
          enableAcceptEncodingGzip: true,
        }),
        originRequestPolicy: lambdaOriginRequestPolicy,
      },
      additionalBehaviors: {
        '/': lambdaBehavior,
        'api/*': lambdaBehavior,
        '_next/data/*': lambdaBehavior,
        '_next/image*': {
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          origin: imageOrigin,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          originRequestPolicy: lambdaOriginRequestPolicy,
          cachePolicy: new CachePolicy(this, 'ImageCachePolicy', {
            queryStringBehavior: CacheQueryStringBehavior.all(),
            headerBehavior: CacheHeaderBehavior.allowList('Accept'),
            cookieBehavior: CacheCookieBehavior.none(),
            defaultTtl: Duration.days(1),
            maxTtl: Duration.days(365),
            minTtl: Duration.days(0),
            enableAcceptEncodingBrotli: true,
            enableAcceptEncodingGzip: true,
          }),
        },
        '_next/*': {
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          origin: staticOrigin,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: new CachePolicy(this, 'StaticCachePolicy', {
            queryStringBehavior: CacheQueryStringBehavior.none(),
            headerBehavior: CacheHeaderBehavior.none(),
            cookieBehavior: CacheCookieBehavior.none(),
            defaultTtl: Duration.days(30),
            maxTtl: Duration.days(60),
            minTtl: Duration.days(30),
            enableAcceptEncodingBrotli: true,
            enableAcceptEncodingGzip: true,
          }),
          responseHeadersPolicy: new ResponseHeadersPolicy(this, 'StaticResponseHeadersPolicy', {
            customHeadersBehavior: {
              customHeaders: [{
                header: 'cache-control',
                override: false,
                value: `public,max-age=${DEFAULT_STATIC_MAX_AGE},immutable`,
              }],
            },
          }),
        },
      },
    });
  }

  private prepareAssetDeployment() {
    const assetPath = path.join(__dirname, this.relativeOpenNextPath, 'assets');

    const cacheControl = CacheControl.fromString(
      `public,max-age=${DEFAULT_STATIC_MAX_AGE},stale-while-revalidate=${DEFAULT_STATIC_STALE_WHILE_REVALIDATE},immutable`
    );

    return new BucketDeployment(this, 'AssetDeployment', {
      sources: [Source.asset(assetPath)],
      destinationBucket: this.staticBucket,
      distribution: this.distribution,
      prune: true,
      cacheControl: [cacheControl],
      logRetention: RetentionDays.ONE_WEEK,
    });
  }

  private prepareCacheDeployment() {
    const assetPath = path.join(__dirname, this.relativeOpenNextPath, 'cache');

    const cacheControl = CacheControl.fromString(
      `public,max-age=${DEFAULT_STATIC_MAX_AGE},stale-while-revalidate=${DEFAULT_STATIC_STALE_WHILE_REVALIDATE},immutable`
    );

    return new BucketDeployment(this, 'CacheDeployment', {
      sources: [Source.asset(assetPath)],
      destinationBucket: this.cacheBucket,
      distribution: this.distribution,
      prune: true,
      cacheControl: [cacheControl],
      logRetention: RetentionDays.ONE_WEEK,
    });
  }

  private prepareDeployment(connectionArn: string, owner: string, repo: string, branch: string) {

    const pipelineBucket = new Bucket(this, 'PipelineBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const sourceArtifact = new Artifact('Source');
    const assetsArtifact = new Artifact('Assets');
    const cacheArtifact = new Artifact('Cache');

    const serverFunctionArtifact = new Artifact('ServerFunctionArtifact');
    const revalidationFunctionArtifact = new Artifact('RevalidationFunctionArtifact');
    const warmerFunctionArtifact = new Artifact('WarmerFunctionArtifact');
    const imageOptimizationFunctionArtifact = new Artifact('ImageOptimizationFunctionArtifact');

    const application = new LambdaApplication(this, 'LambdaApplication');

    const functionsProject = new PipelineProject(this, 'FunctionsProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.MEDIUM,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'corepack enable',
              'corepack prepare pnpm@latest-8 --activate',
              'pnpm i',
            ]
          },
          build: {
            commands: [
              'pnpm build:open',
            ],
          }
        },
        artifacts: {
          files: ["**/*"],
          'secondary-artifacts': {
            ServerFunctionArtifact: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/server-function`,
              'discard-paths': 'yes',
            },
            RevalidationFunctionArtifact: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/revalidation-function`,
              'discard-paths': 'yes',
            },
            WarmerFunctionArtifact: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/warmer-function`,
              'discard-paths': 'yes',
            },
            ImageOptimizationFunctionArtifact: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/image-optimization-function`,
              'discard-paths': 'yes',
            }
          }
        }
      }),
    });

    const assetsProject = new PipelineProject(this, 'AssetsProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.MEDIUM,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'corepack enable',
              'corepack prepare pnpm@latest-8 --activate',
              'pnpm i',
            ]
          },
          build: {
            commands: [
              'pnpm build:open',
            ],
          }
        },
        artifacts: {
          'secondary-artifacts': {
            Assets: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/assets`,
              'discard-paths': 'yes',
            },
            Cache: {
              files: ["**/*"],
              'base-directory': `${this.relativeOpenNextPath}/cache`,
              'discard-paths': 'yes',
            }
          }
        }
      }),
    });

    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: 'GetSource',
      connectionArn,
      owner,
      repo,
      branch,
      output: sourceArtifact,
    });

    // build next, open-next and output artifacts for each function

    const buildFunctions = new CodeBuildAction({
      actionName: 'Functions',
      project: functionsProject,
      input: sourceArtifact,
      outputs: [
        serverFunctionArtifact,
        revalidationFunctionArtifact,
        warmerFunctionArtifact,
        imageOptimizationFunctionArtifact,
      ],
    });

    const buildAssets = new CodeBuildAction({
      actionName: 'Assets',
      project: assetsProject,
      input: sourceArtifact,
      outputs: [
        assetsArtifact,
        cacheArtifact,
      ],
    });

    // function deployments

    const serverDeployAction = this.prepareFunctionDeployAction(
      application,
      'ServerFunction',
      this.serverFunction,
      serverFunctionArtifact
    );
    const revalidationDeployAction = this.prepareFunctionDeployAction(
      application,
      'RevalidationFunction',
      this.revalidationFunction,
      revalidationFunctionArtifact
    );
    const warmerDeployAction = this.prepareFunctionDeployAction(
      application,
      'WarmerFunction',
      this.warmerFunction,
      warmerFunctionArtifact
    );
    const imageOptimizationDeployAction = this.prepareFunctionDeployAction(
      application,
      'ImageOptimizationFunction',
      this.imageOptimizationFunction,
      imageOptimizationFunctionArtifact
    );

    // s3 deployments

    const assetDeployAction = new S3DeployAction({
      actionName: 'DeployAssets',
      input: assetsArtifact,
      bucket: this.staticBucket,
    });

    const cacheDeployAction = new S3DeployAction({
      actionName: 'DeployCache',
      input: cacheArtifact,
      bucket: this.cacheBucket,
    });


    // pipeline
    const pipeline = new Pipeline(this, 'Pipeline', {
      stages: [{
        stageName: 'Source',
        actions: [sourceAction],
      }, {
        stageName: 'BuildFunctions',
        actions: [buildFunctions],
      }, {
        stageName: 'BuildAssets',
        actions: [buildAssets],
      }, {
        stageName: 'Deploy',
        actions: [
          serverDeployAction,
          revalidationDeployAction,
          warmerDeployAction,
          imageOptimizationDeployAction,
          assetDeployAction,
          cacheDeployAction
        ],
      }],
    });
  }

  private prepareFunctionDeployAction(application: LambdaApplication, name: string, fn: Function, input: Artifact) {

    const alias = new Alias(this, `${name}Alias`, {
      aliasName: 'prod',
      version: fn.currentVersion,
    });

    const deploymentGroup = new LambdaDeploymentGroup(this, `${name}DeploymentGroup`, {
      application,
      alias,
      deploymentConfig: LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    const deployAction = new CodeDeployServerDeployAction({
      actionName: `${name}DeployAction`,
      input,
      deploymentGroup,
    });

    return deployAction;
  }

  private buildApp() {
    this.buildNext();
    this.buildOpenNext();
  }

  private buildNext() {
    this.run('pnpm run build', this.relativeNextPath);
  }

  private buildOpenNext() {
    this.run('npx open-next build', this.relativeNextPath);
  }

  private run(cmd: string, cwd: string) {
    const child = child_process.spawnSync(cmd, {
      cwd,
      shell: true,
    });
    console.log(child.stdout.toString());
  }
}
