import { Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

const disconnectHandler: Handler = async (event) => {
  console.log('Disconnect Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const RoomInfo = await DynamoClient.getRoomInfo(ConnectionId)

    if (RoomInfo) {
      const { RoomCode } = RoomInfo
      const Event = await DynamoClient.disconnect(RoomCode, ConnectionId)
      const Connections = publishToConnections(RoomCode, ConnectionId, Event)

      return { statusCode: 200, body: JSON.stringify({ Connections }) }
    }
    return {
      statusCode: 500,
      body: 'Failed to disconnect: RoomCode for ConnectionId not found.',
    }
  } catch (e) {
    console.error('error!', e)
    return {
      statusCode: 500,
      body: 'Failed to disconnect:' + JSON.stringify(e),
    }
  }
}

export default disconnectHandler
