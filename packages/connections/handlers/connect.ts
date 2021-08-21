import { APIGatewayEvent, Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

export const parseCookie = (Cookie: string): { [key: string]: string } => {
  const a = Cookie.split('; ')
  const b = a.map((param) => param.split('='))
  const c = b.filter(([key]) => key)
  const d = Object.fromEntries(c)
  console.log(a, b, c, d)
  return Object.fromEntries(Cookie.split('; ').map((param) => param.split('='))
    .filter(([key]) => key))
}

const connectHandler: Handler<APIGatewayEvent> = async (event) => {
  console.log('Connect Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const RoomCode = event.queryStringParameters?.RoomCode
    const { UserId } = parseCookie(event.headers?.Cookie ?? '')
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
