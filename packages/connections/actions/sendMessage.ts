import dynamo from 'clients/dynamo'
import events from 'clients/events'
import { BadRequestResponse, OKResponse, Response } from 'lib/response'

const sendMessage = async (
  ConnectionId: string,
  Message: string
): Promise<Response> => {
  const ConnectEvent = await dynamo.findConnectEvent(ConnectionId)
  if (ConnectEvent?.RoomCode) {
    const MessageEvent = await dynamo.createMessageEvent(
      ConnectionId,
      ConnectEvent.RoomCode,
      Message
    )
    const Connected = await dynamo.listConnected(ConnectEvent.RoomCode)
    const ConnectionIds = Connected.filter(
      (event) => event.ConnectionId !== ConnectionId
    ).map((event) => event.ConnectionId)
    const PublishEvent = await events.publish(ConnectionIds, MessageEvent)
    return new OKResponse(JSON.stringify({ MessageEvent, PublishEvent }))
  }
  return new BadRequestResponse(
    `Connection id "${ConnectionId}" has no "Connect" event.`
  )
}

export default sendMessage
