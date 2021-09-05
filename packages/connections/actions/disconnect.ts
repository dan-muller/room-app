import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const disconnect = async (
  connectionId: string,
  force?: boolean
): Promise<Response> => {
  logger.debug('disconnect', { connectionId })

  const connectEvent = await dynamo.findConnectEvent(connectionId)
  const roomCode = connectEvent?.RoomCode
  logger.debug('disconnect', { connectEvent, roomCode })

  if (roomCode) {
    const disconnectEvent = await dynamo.createDisconnectEvent(
      connectionId,
      roomCode,
      force
    )
    logger.debug('disconnect', { disconnectEvent })

    const connectedEvents = await dynamo.listConnected(roomCode)
    const connectionIds = connectedEvents.map((event) => event.ConnectionId)
    logger.debug('disconnect', { connectedEvents, connectionIds })

    const publishEvent = await connections.publishEvent(
      connectionIds,
      disconnectEvent
    )
    logger.debug('disconnect', { publishEvent })

    return new OKResponse(
      JSON.stringify({ connectEvent, disconnectEvent, publishEvent })
    )
  }
  return new BadRequestResponse(
    `Connection id "${connectionId}" has no "Connect" event.`
  )
}

export default disconnect
