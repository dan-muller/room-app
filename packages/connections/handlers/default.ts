import { Handler } from 'aws-lambda'

import * as DynamoClient from 'clients/dynamo'
import publishToConnections from 'actions/publishToConnections'

const defaultHandler: Handler = async (event) => {
  console.log('Default Event:', event)
  try {
    const ConnectionId = event.requestContext.connectionId
    const RoomInfo = await DynamoClient.getRoomInfo(ConnectionId)

    if (RoomInfo) {
      const { RoomCode, UserId, UserName } = RoomInfo
      const Event = {
        ConnectionId,
        Message: event.body,
        RoomCode,
        UserId,
        UserName,
      }
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
