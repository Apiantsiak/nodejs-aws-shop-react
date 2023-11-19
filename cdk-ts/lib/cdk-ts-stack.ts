import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_iam as iam,
  aws_s3 as s3,
  aws_cloudfront as cf,
  aws_s3_deployment as s3deploy,
} from 'aws-cdk-lib';


export class CdkS3CloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'NodejsAwsShopReactCdkDeploy', {
      bucketName: 'nodejs-aws-shop-react-cdkdeploy-bucket',
      cors: [
        {
          allowedOrigins: ["'*'"],
          allowedHeaders: ["'*'"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
        },
      ],
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cloudfrontOAI = new cf.OriginAccessIdentity(
      this,
      'NodejsAwsShopReactCdkDeployOAI'
    );

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['S3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const cloudFrontDistribution = new cf.CloudFrontWebDistribution(
      this,
      'NodejsAwsShopReactCdkDeployDistribution',
      {
        defaultRootObject: "index.html",
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.HTTPS_ONLY,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: cloudfrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    new s3deploy.BucketDeployment(this, 'NodejsAwsShopReactCdkDeployment', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution: cloudFrontDistribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, "S3bucket Url", {
      value: bucket.bucketWebsiteUrl,
    });

    new cdk.CfnOutput(this, "Cloudfront Url", {
      value: cloudFrontDistribution.distributionDomainName,
    });
  }
}
