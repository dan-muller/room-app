import { APIGatewayEvent, Handler } from 'aws-lambda'

import parseCookie from 'lib/parseCookie'
import Error from 'lib/error'
import logger from 'lib/logger'

const connectHandler: Handler<APIGatewayEvent> = async (event, context, callback) => {
  const ConnectionId = event.requestContext.connectionId
  const RoomCode = event.queryStringParameters?.RoomCode
  const { UserId } = parseCookie(event.headers?.Cookie ?? '')
  const UserName = event.queryStringParameters?.Name
  if (ConnectionId && RoomCode && UserId && UserName) {
    const i = {
      ConnectionId,
      RoomCode,
      UserId,
      UserName,
    }
    logger.log(i)
    const response = {
      statusCode: 200,
      headers: {'Content-Type': 'text/plain'},
      message: JSON.stringify(i)
    }
    callback(null, response)
    return i
  } else {
    const err = new Error('Invalid request.', 'Missing request arguments.', [
      ...(!ConnectionId ? [`Invalid ConnectionId value: ${ConnectionId}`] : []),
      ...(!RoomCode ? [`Invalid RoomCode value: ${RoomCode}`] : []),
      ...(!UserId ? [`Invalid UserId value: ${UserId}`] : []),
      ...(!UserName ? [`Invalid UserName value: ${UserName}`] : []),
    ].join('. '))
    const response = {
      statusCode: 400,
      headers: {'Content-Type': 'text/plain'},
      message: err.message
    }
    callback(err, response)
    return response
  }
}

export default connectHandler
