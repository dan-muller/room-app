import dynamo from 'clients/dynamo'
import events from 'clients/events'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'
import logger from 'lib/logger'

const connect = async (
  connectionId: string,
  roomCode: string,
  userName: string
): Promise<Response> => {
  logger.trace('connect', { connectionId, roomCode, userName })

  const connectedEvents = await dynamo.listConnected(roomCode)
  const connectionIds = connectedEvents.map((event) => event.ConnectionId)
  logger.trace('connect', { connectedEvents, connectionIds })

  if (connectedEvents.every((event) => event.UserName !== userName)) {
    const connectEvent = await dynamo.createConnectEvent(
      connectionId,
      roomCode,
      userName
    )
    logger.trace('connect', { connectEvent })

    const publishEvent = await events.publish(connectionIds, connectEvent)
    logger.trace('connect', { publishEvent })

    return new OKResponse(JSON.stringify({ connectEvent, publishEvent }))
  }
  return new BadRequestResponse(
    `Cannot connect to room. The name "${userName}" has already been taken.`
  )
}

export default connect
