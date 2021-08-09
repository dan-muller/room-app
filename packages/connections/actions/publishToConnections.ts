import * as ApiClient from 'clients/api'
import * as DynamoClient from 'clients/dynamo'

const publishToConnections = async (
  RoomCode: string,
  ConnectionId: string,
  Event: any
) => {
  const Connections = await DynamoClient.listConnections(RoomCode, {
    filter: (Connection) =>
      Connection.Connected && Connection.ConnectionId !== ConnectionId,
  })
  await ApiClient.postToConnections(Connections, Event)
  return Connections
}

export default publishToConnections
