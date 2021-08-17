import { APIGatewayEvent, Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

const connectHandler: Handler<APIGatewayEvent> = async (event) => {
  console.log('Connect Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const RoomCode = event.queryStringParameters?.RoomCode
    const UserId = event.headers?.UserId
    const UserName = event.queryStringParameters?.Name

    if (ConnectionId && RoomCode && UserId && UserName) {
      const Event = await DynamoClient.connect(
        ConnectionId,
        RoomCode,
        UserId,
        UserName
      )
      const Connections = publishToConnections(RoomCode, ConnectionId, Event)

      return { statusCode: 200, body: JSON.stringify({ Connections }) }
    }
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Please provide all of the values.',
        data: { ConnectionId, RoomCode, UserId, UserName },
      }),
    }
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
