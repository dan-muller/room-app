import { Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

const defaultHandler: Handler = async (event) => {
  console.log('Default Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const { RoomCode, Name } = await DynamoClient.getRoomInfo(ConnectionId)
    const Event = { ConnectionId, Message: event.body, Name, RoomCode }

    if (RoomCode) {
      const Connections = publishToConnections(RoomCode, ConnectionId, Event)

      return { statusCode: 200, body: JSON.stringify({ Connections }) }
    }
    return { statusCode: 500, body: 'RoomCode for ConnectionId not found.' }
  } catch (e) {
    console.error('error!', e)
    return { statusCode: 500, body: JSON.stringify(e) }
  }
}

export default defaultHandler
