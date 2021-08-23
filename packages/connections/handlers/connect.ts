import { APIGatewayEvent, Handler } from 'aws-lambda'

import logger from 'lib/logger'
import parseCookie from 'lib/parseCookie'
import { BadRequest } from 'lib/error'
import { OKResponse } from 'lib/response'

const connectHandler: Handler<APIGatewayEvent> = async (event, _context, callback) => {
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
    const response = new OKResponse(JSON.stringify(i))
    logger.log(response)
    callback(null, response)
    return response
  } else {
    const err = new BadRequest( 'Missing request arguments.', [
      ...(!ConnectionId ? [`Invalid ConnectionId value: ${ConnectionId}`] : []),
      ...(!RoomCode ? [`Invalid RoomCode value: ${RoomCode}`] : []),
      ...(!UserId ? [`Invalid UserId value: ${UserId}`] : []),
      ...(!UserName ? [`Invalid UserName value: ${UserName}`] : []),
    ].join('. '))
    callback(err)
    return err.response
  }
}

export default connectHandler
