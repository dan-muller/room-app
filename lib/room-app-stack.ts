import * as acm from "@aws-cdk/aws-certificatemanager";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import * as apigwv2i from "@aws-cdk/aws-apigatewayv2-integrations";
import * as cdk from "@aws-cdk/core";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as lambda from "@aws-cdk/aws-lambda";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as route53 from "@aws-cdk/aws-route53";
import * as s3 from "@aws-cdk/aws-s3";

import Connections from "./Connections";

export interface RoomAppProps extends cdk.StackProps {
  fromAddress?: string;
  domainName?: string;
  zoneId?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  amazonClientId?: string;
  amazonClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
}

export class RoomAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: RoomAppProps = {}) {
    super(scope, id, props);

    const { domainName, zoneId } = props;

    const stageName = "ws";

    const connectFn = new lambda.Function(this, "ConnectionHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "connections.connectHandler",
      code: lambda.Code.fromAsset("backend"),
      memorySize: 3000,
      environment: {
        NODE_ENV: "production",
      },
      timeout: cdk.Duration.seconds(20),
    });
    const disconnectFn = new lambda.Function(this, "DisconnectionHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "connections.disconnectHandler",
      code: lambda.Code.fromAsset("backend"),
      memorySize: 3000,
      environment: {
        NODE_ENV: "production",
      },
      timeout: cdk.Duration.seconds(20),
    });
    const defaultFn = new lambda.Function(this, "DefaultHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "connections.defaultHandler",
      code: lambda.Code.fromAsset("backend"),
      memorySize: 3000,
      environment: {
        NODE_ENV: "production",
        ENDPOINT: "https://d1vy5lwn12jrv5.cloudfront.net/ws/",
      },
      timeout: cdk.Duration.seconds(20),
    });

    const webSocketApi = new apigwv2.WebSocketApi(this, "RoomAppWS", {
      connectRouteOptions: {
        integration: new apigwv2i.LambdaWebSocketIntegration({
          handler: connectFn,
        }),
      },
      disconnectRouteOptions: {
        integration: new apigwv2i.LambdaWebSocketIntegration({
          handler: disconnectFn,
        }),
      },
      defaultRouteOptions: {
        integration: new apigwv2i.LambdaWebSocketIntegration({
          handler: defaultFn,
        }),
      },
    });

    const ws = new apigwv2.WebSocketStage(this, "ProdStage", {
      webSocketApi,
      stageName,
      autoDeploy: true,
    });

    const frontendBucket = new s3.Bucket(this, "FrontendBucket");

    let hostedZone, wwwDomainName, certificate, domainNames;
    if (domainName && zoneId) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        "HostedZone",
        { hostedZoneId: zoneId, zoneName: domainName + "." }
      );
      wwwDomainName = "www." + domainName;
      certificate = new acm.Certificate(this, "Certificate", {
        domainName,
        subjectAlternativeNames: [wwwDomainName],
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
      domainNames = [domainName, wwwDomainName];
    }

    const distroProps: any = {
      logBucket: new s3.Bucket(this, "DistroLoggingBucket"),
      logFilePrefix: "distribution-access-logs/",
      logIncludesCookies: true,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: "index.html",
      domainNames,
      certificate,
    };

    const distro = new cloudfront.Distribution(this, "Distro", distroProps);

    distro.addBehavior(
      `/${stageName}/*`,
      new origins.HttpOrigin(
        `${webSocketApi.apiId}.execute-api.${this.region}.${this.urlSuffix}`,
        {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }
      ),
      {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: new cloudfront.OriginRequestPolicy(
          this,
          "WSOriginRequestPolicy",
          {
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
              "Sec-WebSocket-Extensions",
              "Sec-WebSocket-Key",
              "Sec-WebSocket-Version"
            ),
          }
        ),
      }
    );

    const connectionsTable = new Connections.Table(this);
    connectionsTable.grantReadWriteData(connectFn);
    connectionsTable.grantReadWriteData(disconnectFn);
    connectionsTable.grantReadWriteData(defaultFn);

    new cdk.CfnOutput(this, "FrontendBucketName", {
      value: frontendBucket.bucketName,
    });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distro.distributionDomainName,
    });
    new cdk.CfnOutput(this, "WSAPIEndpoint", {
      value: webSocketApi.apiEndpoint,
    });
  }
}
