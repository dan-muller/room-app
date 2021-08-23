import { APIGatewayEvent, Handler } from 'aws-lambda'

import parseCookie from 'lib/parseCookie'
import { BadRequest } from 'lib/error'
import logger from 'lib/logger'
import { OK } from '../lib/response'

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
    const response = new OK()
    callback(null, response)
    return response
  } else {
    const err = new BadRequest( 'Missing request arguments.', [
      ...(!ConnectionId ? [`Invalid ConnectionId value: ${ConnectionId}`] : []),
      ...(!RoomCode ? [`Invalid RoomCode value: ${RoomCode}`] : []),
      ...(!UserId ? [`Invalid UserId value: ${UserId}`] : []),
      ...(!UserName ? [`Invalid UserName value: ${UserName}`] : []),
    ].join('. '))
    callback(err, err.response)
    return err.response
  }
}

export default connectHandler
