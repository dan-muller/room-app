import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const connect = async (
  connectionId: string,
  roomCode: string,
  userName: string,
  userId: string
): Promise<Response> => {
  logger.trace('connect', { connectionId, roomCode, userName, userId })

  const connectedEvents = await dynamo.listConnected(roomCode)
  const connectionIds = connectedEvents.map((event) => event.ConnectionId)
  logger.trace('connect', { connectedEvents, connectionIds })

  const existingUserWithName = connectedEvents
    .filter((event) => event.UserId !== userId)
    .some((event) => event.UserName === userName)
  if (existingUserWithName) {
    return new BadRequestResponse(
      `Cannot connect to room. The name "${userName}" has already been taken.`
    )
  }

  const connectEvent = await dynamo.createConnectEvent(
    connectionId,
    roomCode,
    userName,
    userId
  )
  logger.trace('connect', { connectEvent })

  const publishEvent = await connections.publishEvent(
    connectionIds,
    connectEvent
  )
  logger.trace('connect', { publishEvent })

  return new OKResponse(JSON.stringify({ connectEvent, publishEvent }))
}

export default connect
