import connections from 'clients/connections'
import dynamo from 'clients/dynamo'
import logger from 'lib/logger'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const disconnect = async (connectionId: string): Promise<Response> => {
  const log = (...message: any[]) => logger.debug('disconnect', ...message)
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

  const disconnectEvent = await dynamo.createDisconnectEvent(
    connectionId,
    connectEvent.RoomCode,
    connectEvent.UserId,
    connectEvent.UserName
  )
  log({ disconnectEvent })

  const publishEvent = await connections.publishEvent(
    connectionIds,
    disconnectEvent
  )
  log({ publishEvent })

  return new OKResponse(
    JSON.stringify({ connectEvent, disconnectEvent, publishEvent })
  )
}

export default disconnect
