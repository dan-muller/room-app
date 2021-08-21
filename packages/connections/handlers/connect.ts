import { APIGatewayEvent, Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

const parseCookies = (Cookie: string): { [key: string]: string } => Object.fromEntries(Cookie.split(',').map((param) => param.split('='))
  .filter(([key]) => key))

const connectHandler: Handler<APIGatewayEvent> = async (event) => {
  console.log('Connect Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const RoomCode = event.queryStringParameters?.RoomCode
    const { UserId } = parseCookies(event.headers?.Cookie ?? '')
    const UserName = event.queryStringParameters?.Name

    console.log({
      ConnectionId,
      RoomCode,
      UserId,
      UserName,
    })

    if (ConnectionId && RoomCode && UserId && UserName) {
      const Event = await DynamoClient.connect(
        ConnectionId,
        RoomCode,
        UserId,
        UserName,
      )
      const Connections = publishToConnections(RoomCode, ConnectionId, Event)

      const Response = { statusCode: 200, body: JSON.stringify({ Connections }) }
      console.log(Response)
      return Response
    }
    const Response = {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Please provide all of the values.',
        data: { ConnectionId, RoomCode, UserId, UserName },
      }),
    }
    console.log(Response)
    return Response
  } catch (e) {
    console.error('error!', e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to connect.',
        error: e,
      }),
    }
  }
}

export default connectHandler
