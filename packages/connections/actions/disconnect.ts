import dynamo from 'clients/dynamo'
import events from 'clients/events'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const disconnect = async (ConnectionId: string): Promise<Response> => {
  const ConnectEvent = await dynamo.findConnectEvent(ConnectionId)
  if (ConnectEvent?.RoomCode) {
    const DisconnectEvent = await dynamo.createDisconnectEvent(
      ConnectionId,
      ConnectEvent.RoomCode
    )
    const Connected = await dynamo.listConnected(ConnectEvent.RoomCode)
    const ConnectionIds = Connected.map((event) => event.ConnectionId)
    const PublishEvent = await events.publish(ConnectionIds, DisconnectEvent)
    return new OKResponse(JSON.stringify({ DisconnectEvent, PublishEvent }))
  }
  return new BadRequestResponse(
    `Connection id "${ConnectionId}" has no "Connect" event.`
  )
}

export default disconnect
