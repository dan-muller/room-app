import dynamo from 'clients/dynamo'
import events from 'clients/events'
import { OKResponse, Response } from 'lib/response'

const connect = async (
  ConnectionId: string,
  RoomCode: string,
  UserName: string
): Promise<Response> => {
  const ConnectEvent = await dynamo.createConnectEvent(
    ConnectionId,
    RoomCode,
    UserName
  )
  const Connected = await dynamo.listConnected(RoomCode)
  const ConnectionIds = Connected.filter(
    (event) => event.ConnectionId !== ConnectionId
  ).map((event) => event.ConnectionId)
  const PublishEvent = await events.publish(ConnectionIds, ConnectEvent)
  return new OKResponse(JSON.stringify({ ConnectEvent, PublishEvent }))
}

export default connect
