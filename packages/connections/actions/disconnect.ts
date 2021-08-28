import dynamo from 'clients/dynamo'
import events from 'clients/events'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'
import logger from '../lib/logger'

const disconnect = async (connectionId: string): Promise<Response> => {
  logger.trace('disconnect', { connectionId })

  const connectEvent = await dynamo.findConnectEvent(connectionId)
  const roomCode = connectEvent?.RoomCode
  logger.trace('disconnect', { connectEvent, roomCode })

  if (roomCode) {
    const disconnectEvent = await dynamo.createDisconnectEvent(
      connectionId,
      roomCode
    )
    logger.trace('disconnect', { disconnectEvent })

    const connectedEvents = await dynamo.listConnected(roomCode)
    const connectionIds = connectedEvents.map((event) => event.ConnectionId)
    logger.trace('disconnect', { connectedEvents, connectionIds })

    const publishEvent = await events.publish(connectionIds, disconnectEvent)
    logger.trace('disconnect', { publishEvent })

    return new OKResponse(
      JSON.stringify({ connectEvent, disconnectEvent, publishEvent })
    )
  }
  return new BadRequestResponse(
    `Connection id "${connectionId}" has no "Connect" event.`
  )
}

export default disconnect
