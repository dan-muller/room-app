import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const sendMessage = async (
  connectionId: string,
  message: string
): Promise<Response> => {
  logger.debug('sendMessage', { connectionId })

  const connectEvent = await dynamo.findConnectEvent(connectionId)
  const roomCode = connectEvent?.RoomCode
  logger.debug('sendMessage', { connectEvent, roomCode })

  if (roomCode) {
    const messageEvent = await dynamo.createMessageEvent(
      connectionId,
      roomCode,
      message
    )
    logger.debug('sendMessage', { messageEvent })

    const connectedEvents = await dynamo.listConnected(roomCode)
    const connectionIds = connectedEvents.map((event) => event.ConnectionId)
    logger.debug('sendMessage', { connectedEvents, connectionIds })

    const publishEvent = await connections.publishEvent(
      connectionIds,
      messageEvent
    )
    logger.debug('sendMessage', { publishEvent })

    return new OKResponse(
      JSON.stringify({ connectEvent, messageEvent, publishEvent })
    )
  }
  return new BadRequestResponse(
    `Connection id "${connectionId}" has no "Connect" event.`
  )
}

export default sendMessage
