import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const connect = async (
  connectionId: string,
  roomCode: string,
  userId: string,
  userName: string
): Promise<Response> => {
  const log = (...message: any[]) => logger.debug('connect', ...message)
  log({ connectionId, roomCode, userName, userId })

  const connectedEvents = await dynamo.listConnected(roomCode)
  const connectionIds = connectedEvents
    .filter(
      ({ ConnectionId, UserId }) =>
        ConnectionId !== connectionId && UserId !== userId
    )
    .map((event) => event.ConnectionId)
  const existingUserWithName = connectedEvents
    .filter((event) => event.UserId !== userId)
    .some((event) => event.UserName === userName)
  log({ connectedEvents, connectionIds, existingUserWithName })

  if (existingUserWithName) {
    return new BadRequestResponse(
      `Cannot connect to room. The name "${userName}" has already been taken.`
    )
  }

  const connectEvent = await dynamo.createConnectEvent(
    connectionId,
    roomCode,
    userId,
    userName
  )
  log({ connectEvent })

  const publishEvent = await connections.publishEvent(
    connectionIds,
    connectEvent
  )
  log({ publishEvent })

  return new OKResponse(JSON.stringify({ connectEvent, publishEvent }))
}

export default connect
