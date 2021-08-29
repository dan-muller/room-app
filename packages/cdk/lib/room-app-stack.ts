import * as acm from '@aws-cdk/aws-certificatemanager'
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2'
import * as apigwv2i from '@aws-cdk/aws-apigatewayv2-integrations'
import * as cdk from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import * as origins from '@aws-cdk/aws-cloudfront-origins'
import * as route53 from '@aws-cdk/aws-route53'
import * as s3 from '@aws-cdk/aws-s3'

export interface RoomAppProps extends cdk.StackProps {
  fromAddress?: string
  domainName?: string
  zoneId?: string
  facebookAppId?: string
  facebookAppSecret?: string
  amazonClientId?: string
  amazonClientSecret?: string
  googleClientId?: string
  googleClientSecret?: string
}

export class RoomAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: RoomAppProps = {}) {
    super(scope, id, props)

    const { domainName, zoneId } = props

    const stageName = 'ws'

    const connectionsTable = new dynamodb.Table(this, 'Connections', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    connectionsTable.addGlobalSecondaryIndex({
      partitionKey: {
        name: 'ConnectionId',
        type: dynamodb.AttributeType.STRING,
      },
      indexName: 'ConnectionIdIndex',
      projectionType: dynamodb.ProjectionType.ALL,
    })

    const frontendBucket = new s3.Bucket(this, 'FrontendBucket')

    let hostedZone, wwwDomainName, certificate, domainNames
    if (domainName && zoneId) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        'HostedZone',
        { hostedZoneId: zoneId, zoneName: domainName + '.' }
      )
      wwwDomainName = 'www.' + domainName
      certificate = new acm.Certificate(this, 'Certificate', {
        domainName,
        subjectAlternativeNames: [wwwDomainName],
        validation: acm.CertificateValidation.fromDns(hostedZone),
      })
      domainNames = [domainName, wwwDomainName]
    }

    const distro = new cloudfront.Distribution(this, 'Distro', {
      logBucket: new s3.Bucket(this, 'DistroLoggingBucket'),
      logFilePrefix: 'distribution-access-logs/',
      logIncludesCookies: true,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: 'index.html',
      domainNames,
      certificate,
    })

    const environment = {
      CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      CONNECTION_TIMEOUT: '500',
    }

    const lambdaProps = {
      code: lambda.Code.fromAsset('../connections', {
        exclude: ['*.ts', '*.ts.map'],
      }),
      environment,
      memorySize: 3000,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(20),
    }

    const connectFn = new lambda.Function(this, 'ConnectionHandler', {
      ...lambdaProps,
      handler: 'handlers.Connect',
    })
    const disconnectFn = new lambda.Function(this, 'DisconnectionHandler', {
      ...lambdaProps,
      handler: 'handlers.Disconnect',
    })
    const defaultFn = new lambda.Function(this, 'DefaultHandler', {
      ...lambdaProps,
      handler: 'handlers.SendMessage',
    })

    connectionsTable.grantFullAccess(connectFn)
    connectionsTable.grantFullAccess(disconnectFn)
    connectionsTable.grantFullAccess(defaultFn)

    const webSocketApi = new apigwv2.WebSocketApi(this, 'RoomAppWS', {
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
    })
    const webSocketStage = new apigwv2.WebSocketStage(this, 'ProdStage', {
      webSocketApi,
      stageName,
      autoDeploy: true,
    })

    const ENDPOINT = `https://${webSocketApi.apiId}.execute-api.${this.region}.${this.urlSuffix}/${webSocketStage.stageName}/`
    connectFn.addEnvironment('ENDPOINT', ENDPOINT)
    disconnectFn.addEnvironment('ENDPOINT', ENDPOINT)
    defaultFn.addEnvironment('ENDPOINT', ENDPOINT)

    const webSocketArn = `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/${webSocketStage.stageName}/*`
    connectFn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [webSocketArn],
        actions: ['execute-api:Invoke', 'execute-api:ManageConnections'],
      })
    )
    disconnectFn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [webSocketArn],
        actions: ['execute-api:Invoke', 'execute-api:ManageConnections'],
      })
    )
    defaultFn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [webSocketArn],
        actions: ['execute-api:Invoke', 'execute-api:ManageConnections'],
      })
    )

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
          'WSOriginRequestPolicy',
          {
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
              'Sec-WebSocket-Extensions',
              'Sec-WebSocket-Key',
              'Sec-WebSocket-Version'
            ),
            queryStringBehavior:
              cloudfront.OriginRequestQueryStringBehavior.allowList(
                'Name',
                'RoomCode'
              ),
            cookieBehavior:
              cloudfront.OriginRequestCookieBehavior.allowList('UserId'),
          }
        ),
      }
    )

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
    })
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distro.distributionDomainName,
    })
    new cdk.CfnOutput(this, 'WSAPIEndpoint', {
      value: webSocketApi.apiEndpoint,
    })
    new cdk.CfnOutput(this, 'WebSocketARN', { value: webSocketArn })
    new cdk.CfnOutput(this, 'ENDPOINT', { value: ENDPOINT })
  }
}
