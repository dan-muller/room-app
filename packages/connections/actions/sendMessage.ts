import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const sendMessage = async (
  connectionId: string,
  message: string
): Promise<Response> => {
  const log = (...message: any[]) => logger.debug('sendMessage', ...message)
  log({ connectionId })

  const connectEvent = await dynamo.findConnectEvent(connectionId)
  log({ connectEvent })
  if (!connectEvent) {
    return new BadRequestResponse(
      `Connection id "${connectionId}" has not connected to this room.`
    )
  }

  const connectedEvents = await dynamo.listConnected(connectEvent.RoomCode)
  const connectionIds = connectedEvents
    .filter(
      ({ ConnectionId, UserId }) =>
        ConnectionId !== connectionId && UserId !== connectEvent.UserId
    )
    .map((event) => event.ConnectionId)
  log({ connectedEvents, connectionIds })

  const messageEvent = await dynamo.createMessageEvent(
    connectionId,
    connectEvent.RoomCode,
    connectEvent.UserId,
    connectEvent.UserName,
    message
  )
  log({ messageEvent })

  const publishEvent = await connections.publishEvent(
    connectionIds,
    messageEvent
  )
  log({ publishEvent })

  return new OKResponse(
    JSON.stringify({ connectEvent, messageEvent, publishEvent })
  )
}

export default sendMessage
